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

                LawyerId = x.LawyerId,
                ClientId = null,      
                BookingId = null,

                TransactionId = x.TransactionId,
                Amount = x.Amount,
                PaymentDate = x.PaymentDate,

                VerificationStatus = x.VerificationStatus,
                VerifiedBy = x.VerifiedBy,
                VerifiedAt = x.VerifiedAt,
                RejectionReason = x.RejectionReason
            })
            .ToListAsync(cancellationToken);

        var bookingList = await _context.BOOKING_PAYMENT
            .Join(_context.BOOKING,
                p => p.BookingId,
                b => b.BookingId,
                (p, b) => new { p, b })
            .Where(x => request.Status == null || x.p.VerificationStatus == request.Status)
            .Select(x => new PaymentDto
            {
                PaymentType = "Booking",

                LawyerId = x.b.LawyerId,
                ClientId = x.b.ClientId,     
                BookingId = x.b.BookingId,  

                TransactionId = x.p.TransactionId,
                Amount = x.p.Amount,
                PaymentDate = x.p.PaymentDate,

                VerificationStatus = x.p.VerificationStatus,
                VerifiedBy = x.p.VerifiedBy,
                VerifiedAt = x.p.VerifiedAt,
                RejectionReason = x.p.RejectionReason
            })
            .ToListAsync(cancellationToken);

        return membershipList.Concat(bookingList).ToList();
    }
}