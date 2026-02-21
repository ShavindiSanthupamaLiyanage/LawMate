using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.LawyerVerification.Commands;

public class AcceptLawyerVerificationCommand : IRequest<string>
{
    public string UserId { get; set; }
    public string AdminUserId { get; set; }
}

public class AcceptLawyerVerificationCommandHandler 
    : IRequestHandler<AcceptLawyerVerificationCommand, string>
{
    private readonly IApplicationDbContext _context;

    public AcceptLawyerVerificationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(
        AcceptLawyerVerificationCommand request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _context.LAWYER_DETAILS
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (lawyer == null)
            throw new Exception("Lawyer not found");

        lawyer.VerificationStatus = VerificationStatus.Verified;
        lawyer.VerifiedBy = request.AdminUserId;
        lawyer.VerifiedAt = DateTime.UtcNow;
        lawyer.RejectedReason = null;

        await _context.SaveChangesAsync(cancellationToken);

        return "Lawyer verified successfully";
    }
}
