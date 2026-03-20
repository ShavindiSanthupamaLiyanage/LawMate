using System.Security.Claims;
using LawMate.Application.ClientModule.ClientBooking.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/client")]
public class ClientBookingController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientBookingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // ─── GET api/client/appointments ─────────────────────────────────────────
    // Returns all bookings that belong to the currently authenticated client.

    [Authorize]
    [HttpGet("appointments")]
    public async Task<IActionResult> GetClientAppointments()
    {
        try
        {
            var clientId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value
                           ?? throw new UnauthorizedAccessException("Client identity not found.");

            var result = await _mediator.Send(new GetClientAppointmentsQuery(clientId));
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to retrieve appointments", Error = ex.Message });
        }
    }
}