using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.PaymentMaintenance.Queries;

public class GetPaymentByIdQuery : IRequest<PaymentDetailDto>
{
    public string LawyerId { get; set; }
    public string PaymentType { get; set; } // booking | membership
    public string? ClientId { get; set; } // required for booking
}

public class GetPaymentByIdQueryHandler : IRequestHandler<GetPaymentByIdQuery, PaymentDetailDto>
{
    private readonly IApplicationDbContext _context;

    public GetPaymentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaymentDetailDto> Handle(GetPaymentByIdQuery request, CancellationToken cancellationToken)
    {
        if (request.PaymentType.ToLower() == "booking")
        {
            var payment = await _context.BOOKING_PAYMENT
                .Join(_context.BOOKING,
                    p => p.BookingId,
                    b => b.BookingId,
                    (p, b) => new { p, b })
                .Where(x => x.b.LawyerId == request.LawyerId
                            && x.b.ClientId == request.ClientId)
                .Join(_context.USER_DETAIL,
                    x => x.b.LawyerId,
                    lawyer => lawyer.UserId,
                    (x, lawyer) => new { x.p, x.b, lawyer })
                .Join(_context.USER_DETAIL,
                    temp => temp.b.ClientId,
                    client => client.UserId,
                    (temp, client) => new PaymentDetailDto
                    {
                        PaymentType = "Booking",

                        // Lawyer
                        LawyerId = temp.lawyer.UserId,
                        LawyerName = (temp.lawyer.FirstName ?? "") + " " + (temp.lawyer.LastName ?? ""),
                        LawyerEmail = temp.lawyer.Email,

                        // Client
                        ClientId = client.UserId,
                        ClientName = (client.FirstName ?? "") + " " + (client.LastName ?? ""),
                        ClientEmail = client.Email,

                        TransactionId = temp.p.TransactionId,
                        Amount = temp.p.Amount,
                        PaymentDate = temp.p.PaymentDate,

                        VerificationStatus = temp.p.VerificationStatus,
                        VerifiedBy = temp.p.VerifiedBy,
                        VerifiedAt = temp.p.VerifiedAt,
                        RejectionReason = temp.p.RejectionReason,

                        ReceiptDocument = temp.p.ReceiptDocument
                    })
                .OrderByDescending(x => x.PaymentDate) // latest one
                .FirstOrDefaultAsync(cancellationToken);

            return payment;
        }
        else
        {
            var payment = await _context.MEMBERSHIP_PAYMENT
                .Where(p => p.LawyerId == request.LawyerId)
                .Join(_context.USER_DETAIL,
                    p => p.LawyerId,
                    u => u.UserId,
                    (p, u) => new PaymentDetailDto
                    {
                        PaymentType = "Membership",

                        LawyerId = u.UserId,
                        LawyerName = (u.FirstName ?? "") + " " + (u.LastName ?? ""),
                        LawyerEmail = u.Email,

                        TransactionId = p.TransactionId,
                        Amount = p.Amount,
                        PaymentDate = p.PaymentDate,

                        VerificationStatus = p.VerificationStatus,
                        VerifiedBy = p.VerifiedBy,
                        VerifiedAt = p.VerifiedAt,
                        RejectionReason = p.RejectionReason,

                        ReceiptDocument = p.ReceiptDocument
                    })
                .OrderByDescending(x => x.PaymentDate) // latest membership
                .FirstOrDefaultAsync(cancellationToken);

            return payment;
        }
    }
}