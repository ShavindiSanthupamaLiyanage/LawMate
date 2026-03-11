using LawMate.Application.ClientModule.Bookings.Commands;
using LawMate.Application.ClientModule.Bookings.Queries;
using LawMate.Domain.DTOs.Booking;
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

    /// <summary>
    /// Get all appointments for the authenticated client.
    /// </summary>
    [HttpGet("appointments")]
    public async Task<IActionResult> GetAppointments()
    {
        var clientId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(clientId))
            return Unauthorized();

        var result = await _mediator.Send(new GetClientAppointmentsQuery(clientId));
        return Ok(result);
    }

    /// <summary>
    /// Client requests a booking from an available time slot.
    /// Enforces: min 3 days advance, max 3 months ahead.
    /// </summary>
    [HttpPost("bookings")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var clientId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(clientId))
            return Unauthorized();

        var result = await _mediator.Send(new CreateClientBookingCommand
        {
            ClientId = clientId,
            Data = dto
        });

        return CreatedAtAction(nameof(GetAppointments), null, result);
    }
}

