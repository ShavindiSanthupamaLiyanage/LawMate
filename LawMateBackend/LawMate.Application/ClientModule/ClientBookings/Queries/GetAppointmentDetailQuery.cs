
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientBookings.Queries;

public record GetAppointmentDetailQuery(int BookingId, string ClientId)
    : IRequest<AppointmentDetailDto?>;

public class AppointmentDetailDto
{
    public int BookingId { get; set; }
    public string LawyerName { get; set; } = string.Empty;
    public DateTime ScheduledDateTime { get; set; }
    public int Duration { get; set; }
    public string? Location { get; set; }
    public string BookingStatus { get; set; } = string.Empty;
    public string PaymentStatus { get; set; } = string.Empty;
    public decimal Amount { get; set; }

    // Controls whether the "Upload Payment Slip" button is shown
    public bool CanUploadSlip { get; set; }

    // Controls whether the "Cancel Appointment" button is shown
    public bool CanCancel { get; set; }
}

public class GetAppointmentDetailQueryHandler
    : IRequestHandler<GetAppointmentDetailQuery, AppointmentDetailDto?>
{
    private readonly IApplicationDbContext _context;

    public GetAppointmentDetailQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<AppointmentDetailDto?> Handle(
        GetAppointmentDetailQuery request,
        CancellationToken cancellationToken)
    {
        var booking = await _context.BOOKING
            .FirstOrDefaultAsync(
                b => b.BookingId == request.BookingId
                     && b.ClientId == request.ClientId,
                cancellationToken);

        if (booking is null) return null;

        // Get lawyer name
        var lawyerUser = await _context.USER_DETAIL
            .FirstOrDefaultAsync(u => u.UserId == booking.LawyerId, cancellationToken);

        // Check if slip already uploaded (pending)
        var hasPendingPayment = await _context.BOOKING_PAYMENT
            .AnyAsync(
                p => p.BookingId          == booking.BookingId
                     && p.VerificationStatus == VerificationStatus.Pending,
                cancellationToken);

        return new AppointmentDetailDto
        {
            BookingId         = booking.BookingId,
            LawyerName        = lawyerUser?.UserName ?? "—",
            ScheduledDateTime = booking.ScheduledDateTime,
            Duration          = booking.Duration,
            Location          = booking.Location,
            BookingStatus     = booking.BookingStatus.ToString(),
            PaymentStatus     = booking.PaymentStatus.ToString(),
            Amount            = booking.Amount,

            // Upload allowed only if Accepted and no slip pending
            CanUploadSlip = booking.BookingStatus == BookingStatus.Accepted
                            && !hasPendingPayment,

            // Cancel allowed only if Pending or Accepted
            CanCancel = booking.BookingStatus == BookingStatus.Pending
                        || booking.BookingStatus == BookingStatus.Accepted,
        };
    }
}