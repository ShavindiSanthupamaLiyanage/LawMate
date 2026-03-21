using System.Security.Claims;
using LawMate.Application.ClientModule.ClientBooking.Queries;
using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.ClientModule;

[ApiController]
[Route("api/client")]
[Authorize]
public class ClientBookingController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientBookingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private string? ClientId =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    private IActionResult Unauthorized401() =>
        Unauthorized(new { message = "Client identity could not be resolved." });

    // ─── GET api/client/appointments ─────────────────────────────────────────
    // Returns all bookings for the currently authenticated client.

    [HttpGet("appointments")]
    public async Task<IActionResult> GetClientAppointments()
    {
        try
        {
            if (ClientId is null) return Unauthorized401();

            var result = await _mediator.Send(new GetClientAppointmentsQuery(ClientId));
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to retrieve appointments", Error = ex.Message });
        }
    }

    // ─── POST api/client/appointments/{bookingId}/cancel ─────────────────────
    // Client cancels their own booking. Only Pending / Accepted / Confirmed
    // bookings can be cancelled.

    [HttpPost("appointments/{bookingId:int}/cancel")]
    public async Task<IActionResult> CancelAppointment(
        int bookingId,
        [FromBody] CancelClientBookingRequest body)
    {
        if (ClientId is null) return Unauthorized401();

        if (string.IsNullOrWhiteSpace(body.Reason))
            return BadRequest(new { message = "Cancellation reason is required." });

        var success = await _mediator.Send(
            new CancelClientBookingCommand(bookingId, ClientId, body.Reason));

        if (!success)
            return NotFound(new { message = "Booking not found or cannot be cancelled." });

        return Ok(new { message = "Appointment cancelled successfully." });
    }
}

// ─── Request body ─────────────────────────────────────────────────────────────
public record CancelClientBookingRequest(string Reason);