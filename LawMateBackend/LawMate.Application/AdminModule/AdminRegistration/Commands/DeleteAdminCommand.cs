using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminRegistration.Commands;

public class DeleteAdminCommand : IRequest<bool>
{
    public string UserId { get; set; }

    public DeleteAdminCommand(string userId)
    {
        UserId = userId;
    }
}

public class DeleteAdminCommandHandler : IRequestHandler<DeleteAdminCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public DeleteAdminCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(DeleteAdminCommand request, CancellationToken cancellationToken)
    {
        var admin = await _context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (admin == null)
            throw new Exception("Admin not found");

        admin.RecordStatus = 0;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}