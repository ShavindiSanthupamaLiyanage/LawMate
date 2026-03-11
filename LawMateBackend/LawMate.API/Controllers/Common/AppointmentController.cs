using LawMate.Application.Common.Bookings.Queries;
using LawMate.Application.LawyerModule.Appointments.Commands;
using LawMate.Application.LawyerModule.Appointments.Queries;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.Common;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentController : ControllerBase
{
    private readonly IMediator _mediator;

    public AppointmentController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all appointments for the logged-in lawyer.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lawyerId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(lawyerId))
            return Unauthorized();

        var result = await _mediator.Send(new GetLawyerAppointmentsQuery(lawyerId));
        return Ok(result);
    }

    /// <summary>
    /// Get specific appointment details by booking ID.
    /// </summary>
    [HttpGet("{bookingId}")]
    public async Task<IActionResult> GetById(int bookingId)
    {
        var result = await _mediator.Send(new GetBookingByIdQuery(bookingId));
        return Ok(result);
    }

    /// <summary>
    /// Update appointment status/details (accept, reject, modify).
    /// </summary>
    [HttpPatch("{bookingId}")]
    public async Task<IActionResult> Update(int bookingId, [FromBody] UpdateBookingDto dto)
    {
        var userId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _mediator.Send(new UpdateAppointmentCommand
        {
            BookingId = bookingId,
            UserId = userId,
            Data = dto
        });

        return Ok(result);
    }

    /// <summary>
    /// Cancel an appointment and release the time slot.
    /// </summary>
    [HttpDelete("{bookingId}")]
    public async Task<IActionResult> Cancel(int bookingId)
    {
        var userId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        await _mediator.Send(new CancelAppointmentCommand
        {
            BookingId = bookingId,
            UserId = userId
        });

        return NoContent();
    }
}

