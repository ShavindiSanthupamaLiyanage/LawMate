using LawMate.Domain.DTOs;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyer/requests")]
[Authorize(Roles = "Lawyer")]
public class LawyerRequestController : ControllerBase
{
    private readonly ILawyerRequestService _service;

    public LawyerRequestController(ILawyerRequestService service)
    {
        _service = service;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// <summary>Extracts the authenticated lawyer's UserId from the JWT.</summary>
    private string? LawyerId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    private IActionResult Unauthorized401() =>
        Unauthorized(new { message = "Lawyer identity could not be resolved." });

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/lawyer/requests?status=Pending
    // Returns the list shown on the Requests screen for the given tab.
    //   status: Pending | Confirmed | Rejected
    //   (Passing "Confirmed" returns both Confirmed and Accepted rows.)
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<BookingListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetRequests(
        [FromQuery] BookingStatus status = BookingStatus.Pending,
        CancellationToken ct = default)
    {
        if (LawyerId is null) return Unauthorized401();

        var items = await _service.GetRequestsAsync(LawyerId, status, ct);
        return Ok(items);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/lawyer/requests/{bookingId}
    // Returns the full detail shown in AppointmentView.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpGet("{bookingId:int}")]
    [ProducesResponseType(typeof(BookingDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetRequestById(
        int bookingId,
        CancellationToken ct = default)
    {
        if (LawyerId is null) return Unauthorized401();

        var detail = await _service.GetRequestByIdAsync(bookingId, LawyerId, ct);
        if (detail is null)
            return NotFound(new { message = $"Booking {bookingId} not found." });

        return Ok(detail);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/lawyer/requests/{bookingId}/accept
    // Transitions Pending → Accepted.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("{bookingId:int}/accept")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptRequest(
        int bookingId,
        CancellationToken ct = default)
    {
        if (LawyerId is null) return Unauthorized401();

        var success = await _service.AcceptRequestAsync(bookingId, LawyerId, ct);
        if (!success)
            return NotFound(new { message = "Pending booking not found or already processed." });

        return Ok(new { message = "Appointment accepted successfully." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/lawyer/requests/{bookingId}/reject
    // Body: { "reason": "Schedule conflict" }
    // Transitions Pending → Rejected.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("{bookingId:int}/reject")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RejectRequest(
        int bookingId,
        [FromBody] RejectBookingRequest body,
        CancellationToken ct = default)
    {
        if (LawyerId is null) return Unauthorized401();

        if (string.IsNullOrWhiteSpace(body.Reason))
            return BadRequest(new { message = "Rejection reason is required." });

        var success = await _service.RejectRequestAsync(bookingId, LawyerId, body.Reason, ct);
        if (!success)
            return NotFound(new { message = "Pending booking not found or already processed." });

        return Ok(new { message = "Appointment rejected." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/lawyer/requests/{bookingId}/cancel
    // Body: { "reason": "Client unavailable" }
    // Transitions Confirmed or Accepted → Cancelled.
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("{bookingId:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CancelRequest(
        int bookingId,
        [FromBody] CancelBookingRequest body,
        CancellationToken ct = default)
    {
        if (LawyerId is null) return Unauthorized401();

        if (string.IsNullOrWhiteSpace(body.Reason))
            return BadRequest(new { message = "Cancellation reason is required." });

        var success = await _service.CancelRequestAsync(bookingId, LawyerId, body.Reason, ct);
        if (!success)
            return NotFound(new { message = "Active booking not found or cannot be cancelled." });

        return Ok(new { message = "Appointment cancelled." });
    }
}