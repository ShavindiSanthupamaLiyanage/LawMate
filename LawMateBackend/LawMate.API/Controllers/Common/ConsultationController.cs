using LawMate.Application.Common.Bookings.Commands;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.Common;

[ApiController]
[Route("api/consultation")]
[Authorize]
public class ConsultationController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConsultationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Update consultation status (Scheduled/InProgress/Completed/Cancelled/NoShow).
    /// </summary>
    [HttpPatch("{bookingId}")]
    public async Task<IActionResult> UpdateStatus(int bookingId, [FromBody] UpdateConsultationDto dto)
    {
        var userId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _mediator.Send(new UpdateConsultationCommand
        {
            BookingId = bookingId,
            UserId = userId,
            Data = dto
        });

        return Ok(result);
    }

    /// <summary>
    /// Mark consultation as completed (convenience endpoint).
    /// </summary>
    [HttpPost("{bookingId}/complete")]
    public async Task<IActionResult> Complete(int bookingId)
    {
        var userId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _mediator.Send(new CompleteConsultationCommand
        {
            BookingId = bookingId,
            UserId = userId
        });

        return Ok(result);
    }
}
