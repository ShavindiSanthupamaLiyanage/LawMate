using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Booking;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Infrastructure.Services.LawyerModule;

public class LawyerRequestService : ILawyerRequestService
{
    private readonly IApplicationDbContext _db;

    public LawyerRequestService(IApplicationDbContext db)
    {
        _db = db;
    }

    // ── List ──────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<BookingListItemDto>> GetRequestsAsync(
        string lawyerId,
        BookingStatus statusFilter,
        CancellationToken ct = default)
    {
        var allowedStatuses = statusFilter == BookingStatus.Confirmed
            ? new[] { BookingStatus.Confirmed, BookingStatus.Accepted }
            : new[] { statusFilter };

        var query =
            from b  in _db.BOOKING
            join u  in _db.USER_DETAIL    on b.ClientId equals u.UserId
            join cd in _db.CLIENT_DETAILS on b.ClientId equals cd.UserId
            where b.LawyerId == lawyerId
               && allowedStatuses.Contains(b.BookingStatus)
            orderby b.CreatedAt descending
            select new BookingListItemDto
            {
                BookingId         = b.BookingId,
                ClientName        = u.FirstName + " " + u.LastName,
                ProfilePicUrl     = u.ProfileImage,
                CaseType          = b.IssueDescription ?? string.Empty,
                Phone             = u.ContactNumber ?? string.Empty,
                ScheduledDateTime = b.ScheduledDateTime,
                Mode              = b.PaymentMode,
                Status            = b.BookingStatus,
                RejectionReason   = b.RejectionReason,
                CreatedAt         = b.CreatedAt ?? DateTime.UtcNow,
            };

        return await query.ToListAsync(ct);
    }

    // ── Detail ────────────────────────────────────────────────────────────────

    public async Task<BookingDetailDto?> GetRequestByIdAsync(
        int bookingId,
        string lawyerId,
        CancellationToken ct = default)
    {
        var result = await (
            from b  in _db.BOOKING
            join u  in _db.USER_DETAIL    on b.ClientId equals u.UserId
            join cd in _db.CLIENT_DETAILS on b.ClientId equals cd.UserId
            where b.BookingId == bookingId && b.LawyerId == lawyerId
            select new BookingDetailDto
            {
                BookingId         = b.BookingId,
                ClientName        = u.FirstName + " " + u.LastName,
                ProfilePicUrl     = u.ProfileImage,
                Email             = u.Email ?? string.Empty,
                Phone             = u.ContactNumber ?? string.Empty,
                Nic               = u.NIC ?? string.Empty,
                Address           = cd.Address ?? string.Empty,
                CaseType          = b.IssueDescription ?? string.Empty,
                CaseNote          = b.IssueDescription,
                CreatedBy         = b.CreatedBy ?? string.Empty,
                ScheduledDateTime = b.ScheduledDateTime,
                Duration          = b.Duration,
                PaymentMode       = b.PaymentMode,
                Location          = b.Location,
                Status            = b.BookingStatus,
                RejectionReason   = b.RejectionReason,
            }
        ).FirstOrDefaultAsync(ct);

        return result;
    }

    // ── Accept ────────────────────────────────────────────────────────────────

    public async Task<bool> AcceptRequestAsync(
        int bookingId,
        string lawyerId,
        CancellationToken ct = default)
    {
        var booking = await GetOwnedPendingBooking(bookingId, lawyerId, ct);
        if (booking is null) return false;

        booking.BookingStatus = BookingStatus.Accepted;
        booking.ModifiedBy    = lawyerId;
        booking.ModifiedAt    = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Reject ────────────────────────────────────────────────────────────────

    public async Task<bool> RejectRequestAsync(
        int bookingId,
        string lawyerId,
        string reason,
        CancellationToken ct = default)
    {
        var booking = await GetOwnedPendingBooking(bookingId, lawyerId, ct);
        if (booking is null) return false;

        booking.BookingStatus   = BookingStatus.Rejected;
        booking.RejectionReason = reason;
        booking.ModifiedBy      = lawyerId;
        booking.ModifiedAt      = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Cancel ────────────────────────────────────────────────────────────────

    public async Task<bool> CancelRequestAsync(
        int bookingId,
        string lawyerId,
        string reason,
        CancellationToken ct = default)
    {
        var booking = await _db.BOOKING.FirstOrDefaultAsync(
            b => b.BookingId  == bookingId
              && b.LawyerId   == lawyerId
              && (b.BookingStatus == BookingStatus.Confirmed
               || b.BookingStatus == BookingStatus.Accepted),
            ct);

        if (booking is null) return false;

        booking.BookingStatus   = BookingStatus.Cancelled;
        booking.RejectionReason = reason;
        booking.ModifiedBy      = lawyerId;
        booking.ModifiedAt      = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return true;
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Task<BOOKING?> GetOwnedPendingBooking(
        int bookingId,
        string lawyerId,
        CancellationToken ct)
        => _db.BOOKING.FirstOrDefaultAsync(
               b => b.BookingId    == bookingId
                 && b.LawyerId     == lawyerId
                 && b.BookingStatus == BookingStatus.Pending,
               ct);
}