using LawMate.Application.LawyerModule.LawyerRequest.Commands;
using LawMate.Application.LawyerModule.LawyerRequest.Queries;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using LawMate.Domain.DTOs;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyer/requests")]
[Authorize(Roles = "Lawyer")]
public class LawyerRequestController : ControllerBase
{
    private readonly IMediator _mediator;

    public LawyerRequestController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private string? LawyerId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    private IActionResult Unauthorized401() =>
        Unauthorized(new { message = "Lawyer identity could not be resolved." });

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/lawyer/requests?status=Pending
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

        var items = await _mediator.Send(
            new GetLawyerRequestsQuery(LawyerId, status), ct);

        return Ok(items);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/lawyer/requests/{bookingId}
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

        var detail = await _mediator.Send(
            new GetLawyerRequestByIdQuery(bookingId, LawyerId), ct);

        if (detail is null)
            return NotFound(new { message = $"Booking {bookingId} not found." });

        return Ok(detail);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/lawyer/requests/{bookingId}/accept
    // ─────────────────────────────────────────────────────────────────────────
    [HttpPost("{bookingId:int}/accept")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AcceptRequest(
        int bookingId,
        [FromBody] string? location,
        CancellationToken ct = default)
    {
        if (LawyerId is null) return Unauthorized401();

        var success = await _mediator.Send(
            new AcceptLawyerRequestCommand(bookingId, LawyerId, location), ct);

        if (!success)
            return NotFound(new { message = "Pending booking not found or already processed." });

        return Ok(new { message = "Appointment accepted successfully." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/lawyer/requests/{bookingId}/reject
    // Body: { "reason": "Schedule conflict" }
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

        var success = await _mediator.Send(
            new RejectLawyerRequestCommand(bookingId, LawyerId, body.Reason), ct);

        if (!success)
            return NotFound(new { message = "Pending booking not found or already processed." });

        return Ok(new { message = "Appointment rejected." });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/lawyer/requests/{bookingId}/cancel
    // Body: { "reason": "Client unavailable" }
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

        var success = await _mediator.Send(
            new CancelLawyerRequestCommand(bookingId, LawyerId, body.Reason), ct);

        if (!success)
            return NotFound(new { message = "Active booking not found or cannot be cancelled." });

        return Ok(new { message = "Appointment cancelled." });
    }
}

// ── Request body models ───────────────────────────────────────────────────────
public record RejectBookingRequest(string Reason);
public record CancelBookingRequest(string Reason);