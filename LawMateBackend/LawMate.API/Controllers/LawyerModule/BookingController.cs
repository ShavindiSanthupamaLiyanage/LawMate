using LawMate.Application.LawyerModule.LawyerBooking.Commands;
using LawMate.Application.LawyerModule.LawyerBooking.Queries;
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

    /// <summary>
    /// Get all appointments for a specific lawyer with optional date filtering
    /// </summary>
    /// <param name="lawyerId">The lawyer's user ID</param>
    /// <param name="startDate">Optional start date filter (inclusive)</param>
    /// <param name="endDate">Optional end date filter (inclusive)</param>
    [Authorize]
    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetLawyerAppointments(
        string lawyerId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var result = await _mediator.Send(new GetLawyerAppointmentsQuery(
                lawyerId,
                startDate,
                endDate
            ));

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to retrieve appointments",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Get a specific booking/appointment by ID
    /// </summary>
    /// <param name="bookingId">The booking ID</param>
    [Authorize]
    [HttpGet("{bookingId}")]
    public async Task<IActionResult> GetBookingById(int bookingId)
    {
        try
        {
            var result = await _mediator.Send(new GetBookingByIdQuery(bookingId));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to retrieve booking",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Create a manual appointment (lawyer-initiated)
    /// </summary>
    /// <param name="request">The booking details</param>
    [Authorize]
    [HttpPost]
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
                Message = "Appointment created successfully",
                BookingId = bookingId,
                AppointmentId = $"APT-{bookingId:D4}"
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                Message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to create appointment",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Update the status of a booking
    /// </summary>
    /// <param name="bookingId">The booking ID</param>
    /// <param name="request">The status update details</param>
    [Authorize]
    [HttpPatch("{bookingId}/status")]
    public async Task<IActionResult> UpdateBookingStatus(
        int bookingId,
        [FromBody] UpdateBookingStatusDto request)
    {
        try
        {
            await _mediator.Send(new UpdateBookingStatusCommand
            {
                BookingId = bookingId,
                Data = request
            });

            return Ok(new
            {
                Message = "Booking status updated successfully",
                BookingId = bookingId,
                NewStatus = request.Status.ToString()
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new
            {
                Message = ex.Message
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to update booking status",
                Error = ex.Message
            });
        }
    }
}
