using System.Security.Claims;
using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Application.LawyerModule.LawyerBooking.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/bookings")]
public class BookingController : ControllerBase
{
    private readonly IMediator _mediator;

    public BookingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // ─── GET api/bookings/lawyer/{lawyerId} ───────────────────────────────────

    [Authorize]
    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetLawyerAppointments(
        string lawyerId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate   = null)
    {
        try
        {
            var result = await _mediator.Send(new GetLawyerAppointmentsQuery(
                lawyerId, startDate, endDate
            ));
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to retrieve appointments", Error = ex.Message });
        }
    }

    // ─── GET api/bookings/{bookingId} ─────────────────────────────────────────

    [Authorize]
    [HttpGet("{bookingId:int}")]
    public async Task<IActionResult> GetBookingById(int bookingId)
    {
        try
        {
            var result = await _mediator.Send(new GetBookingByIdQuery(bookingId));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to retrieve booking", Error = ex.Message });
        }
    }

    // ─── POST api/bookings (client-initiated, slot-based) ─────────────────────

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] ClientCreateBookingDto request)
    {
        try
        {
            var clientId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value
                        ?? throw new UnauthorizedAccessException("Client identity not found.");

            var bookingId = await _mediator.Send(new CreateClientBookingCommand
            {
                ClientId = clientId,
                Data     = request,
            });

            return Ok(new
            {
                Message       = "Booking created successfully",
                BookingId     = bookingId,
                AppointmentId = $"APT-{bookingId:D4}",
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { Message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to create booking", Error = ex.Message });
        }
    }

    // ─── POST api/bookings/manual (lawyer-initiated, kept as-is) ─────────────

    [Authorize]
    [HttpPost("manual")]
    public async Task<IActionResult> CreateManualBooking([FromBody] CreateManualBookingDto request)
    {
        try
        {
            var bookingId = await _mediator.Send(new CreateManualBookingCommand
            {
                Data = request
            });

            return Ok(new
            {
                Message       = "Appointment created successfully",
                BookingId     = bookingId,
                AppointmentId = $"APT-{bookingId:D4}",
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to create appointment", Error = ex.Message });
        }
    }

    // ─── PATCH api/bookings/{bookingId}/status ────────────────────────────────

    [Authorize]
    [HttpPatch("{bookingId:int}/status")]
    public async Task<IActionResult> UpdateBookingStatus(
        int bookingId,
        [FromBody] UpdateBookingStatusDto request)
    {
        try
        {
            await _mediator.Send(new UpdateBookingStatusCommand
            {
                BookingId = bookingId,
                Data      = request,
            });

            return Ok(new
            {
                Message   = "Booking status updated successfully",
                BookingId = bookingId,
                NewStatus = request.Status.ToString(),
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = "Failed to update booking status", Error = ex.Message });
        }
    }
}