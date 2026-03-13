using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminRegistration.Commands;

public class ChangeAdminProfileImageCommand : IRequest<bool>
{
    public string UserId { get; set; }

    public IFormFile ProfileImage { get; set; }
}

public class ChangeAdminProfileImageCommandHandler 
    : IRequestHandler<ChangeAdminProfileImageCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public ChangeAdminProfileImageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(ChangeAdminProfileImageCommand request, CancellationToken cancellationToken)
    {
        var admin = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (admin == null)
            throw new Exception("Admin not found");

        if (request.ProfileImage != null)
        {
            using var ms = new MemoryStream();
            await request.ProfileImage.CopyToAsync(ms);
            admin.ProfileImage = ms.ToArray();
        }

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}