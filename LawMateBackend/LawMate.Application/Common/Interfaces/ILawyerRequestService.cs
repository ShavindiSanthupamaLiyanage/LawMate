using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;

namespace LawMate.Application.Common.Interfaces;

public interface ILawyerRequestService
{
    /// <summary>
    /// Returns all bookings for the lawyer filtered by status.
    /// Passing <c>Confirmed</c> returns both Confirmed and Accepted records
    /// (matching the "Confirmed" tab which shows both badges).
    /// </summary>
    Task<IEnumerable<BookingListItemDto>> GetRequestsAsync(
        string lawyerId,
        BookingStatus statusFilter,
        CancellationToken ct = default);

    Task<BookingDetailDto?> GetRequestByIdAsync(
        int bookingId,
        string lawyerId,
        CancellationToken ct = default);

    Task<bool> AcceptRequestAsync(
        int bookingId,
        string lawyerId,
        CancellationToken ct = default);

    Task<bool> RejectRequestAsync(
        int bookingId,
        string lawyerId,
        string reason,
        CancellationToken ct = default);

    Task<bool> CancelRequestAsync(
        int bookingId,
        string lawyerId,
        string reason,
        CancellationToken ct = default);
}