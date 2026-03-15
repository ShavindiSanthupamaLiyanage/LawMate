using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.PaymentMaintenance.Queries;

public class GetPaymentsQuery : IRequest<List<PaymentDto>>
{
    public VerificationStatus? Status { get; set; }
}

public class GetPaymentsQueryHandler : IRequestHandler<GetPaymentsQuery, List<PaymentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPaymentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<PaymentDto>> Handle(GetPaymentsQuery request, CancellationToken cancellationToken)
    {
        var membership = _context.MEMBERSHIP_PAYMENT.AsQueryable();

        var booking = _context.BOOKING_PAYMENT.AsQueryable();

        if (request.Status != null)
        {
            membership = membership.Where(x => x.VerificationStatus == request.Status);
            booking = booking.Where(x => x.VerificationStatus == request.Status);
        }

        var membershipList = await membership
            .Select(x => new PaymentDto
            {
                PaymentType = "Membership",
                TransactionId = x.TransactionId,
                LawyerId = x.LawyerId,
                Amount = x.Amount,
                PaymentDate = x.PaymentDate,
                VerificationStatus = x.VerificationStatus,
                VerifiedBy = x.VerifiedBy,
                VerifiedAt = x.VerifiedAt,
                RejectionReason = x.RejectionReason
            })
            .ToListAsync(cancellationToken);

        var bookingList = await booking
            .Select(x => new PaymentDto
            {
                PaymentType = "Booking",
                TransactionId = x.TransactionId,
                LawyerId = x.LawyerId,
                Amount = x.Amount,
                PaymentDate = x.PaymentDate,
                VerificationStatus = x.VerificationStatus,
                VerifiedBy = x.VerifiedBy,
                VerifiedAt = x.VerifiedAt,
                RejectionReason = x.RejectionReason
            })
            .ToListAsync(cancellationToken);

        return membershipList.Concat(bookingList).ToList();
    }
}