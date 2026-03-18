using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminFinanceVerification.Queries;

public class GetAllFinanceDetailsQuery : IRequest<List<FinanceDetailsDto>>
{
}

public class GetAllFinanceDetailsQueryHandler 
    : IRequestHandler<GetAllFinanceDetailsQuery, List<FinanceDetailsDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllFinanceDetailsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<FinanceDetailsDto>> Handle(
        GetAllFinanceDetailsQuery request, 
        CancellationToken cancellationToken)
    {
        var result = await (
            from payment in _context.BOOKING_PAYMENT
            
            where payment.VerificationStatus == VerificationStatus.Pending
                  || payment.VerificationStatus == VerificationStatus.Verified

            join user in _context.USER_DETAIL
                on payment.LawyerId equals user.UserId

            join booking in _context.BOOKING
                on payment.BookingId equals booking.BookingId

            select new FinanceDetailsDto
            {
                // Lawyer Details
                LawyerId = user.UserId,
                FullName = user.FirstName + " " + user.LastName,
                NIC = user.NIC,
                Email = user.Email,
                ContactNumber = user.ContactNumber,

                // Booking Details
                BookingId = booking.BookingId,
                ScheduledDateTime = booking.ScheduledDateTime,
                Duration = booking.Duration,

                // Payment Details
                TransactionId = payment.TransactionId,
                Amount = payment.Amount,
                PaymentDate = payment.PaymentDate,
                VerificationStatus = payment.VerificationStatus,
                RejectionReason = payment.RejectionReason,
                VerifiedBy = payment.VerifiedBy,
                VerifiedAt = payment.VerifiedAt,
                PlatformCommission = payment.PlatformCommission,
                LawyerFee = payment.LawyerFee,
                IsPaid = payment.IsPaid,
                SlipNumber = payment.SlipNumber,
                ReceiptDocument = payment.ReceiptDocument
            }
        ).ToListAsync(cancellationToken);

        return result;
    }
}