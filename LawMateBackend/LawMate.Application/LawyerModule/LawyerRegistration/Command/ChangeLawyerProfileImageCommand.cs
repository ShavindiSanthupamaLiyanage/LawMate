using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Command;

public class ChangeLawyerProfileImageCommand : IRequest<USER_DETAIL>
{
    public string UserId { get; set; }
    public IFormFile ProfileImage { get; set; }
}

public class ChangeLawyerProfileImageCommandHandler 
    : IRequestHandler<ChangeLawyerProfileImageCommand, USER_DETAIL>
{
    private readonly IApplicationDbContext _context;

    public ChangeLawyerProfileImageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<USER_DETAIL> Handle(
        ChangeLawyerProfileImageCommand request,
        CancellationToken cancellationToken)
    {
        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (user == null)
            throw new KeyNotFoundException("User not found");

        if (request.ProfileImage != null)
        {
            using var ms = new MemoryStream();
            await request.ProfileImage.CopyToAsync(ms, cancellationToken);
            user.ProfileImage = ms.ToArray();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return user;
    }
}
