using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands;

public class SuspendClientCommand : IRequest<string>
{
    public string UserId { get; set; }
    public string SuspendedBy { get; set; }
    public string SuspendedReason { get; set; }
}

public class SuspendClientCommandHandler : IRequestHandler<SuspendClientCommand, string>
{
    private readonly IApplicationDbContext _context;

    public SuspendClientCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(SuspendClientCommand request, CancellationToken cancellationToken)
    {
        // Get user
        var user = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == request.UserId, cancellationToken);

        if (user == null)
            throw new Exception("User not found");

        // Check role
        if (user.UserRole != UserRole.Client)
            throw new Exception("Only clients can be suspended");

        // Get client details
        var client = await _context.CLIENT_DETAILS
            .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

        if (client == null)
            throw new Exception("Client details not found");

        user.State = State.Inactive;
        
        client.SuspendedBy = request.SuspendedBy;
        client.SuspendedReason = request.SuspendedReason;
        client.SuspendedAt = DateTime.Now;

        await _context.SaveChangesAsync(cancellationToken);

        return "Client suspended successfully";
    }
}