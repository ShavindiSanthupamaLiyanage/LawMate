using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.LawyerVerification.Commands;

public class RejectLawyerVerificationCommand : IRequest<string>
{
    public string UserId { get; set; }
    public string AdminUserId { get; set; }
    public string RejectedReason { get; set; }
}

public class RejectLawyerVerificationCommandHandler 
    : IRequestHandler<RejectLawyerVerificationCommand, string>
{
    private readonly IApplicationDbContext _context;

    public RejectLawyerVerificationCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<string> Handle(
        RejectLawyerVerificationCommand request,
        CancellationToken cancellationToken)
    {
        var lawyer = await _context.LAWYER_DETAILS
            .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

        if (lawyer == null)
            throw new Exception("Lawyer not found");

        lawyer.VerificationStatus = VerificationStatus.Rejected;
        lawyer.VerifiedBy = request.AdminUserId;
        lawyer.VerifiedAt = DateTime.UtcNow;
        lawyer.RejectedReason = request.RejectedReason;

        await _context.SaveChangesAsync(cancellationToken);

        return "Lawyer rejected successfully";
    }
}

