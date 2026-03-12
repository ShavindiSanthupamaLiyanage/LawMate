using LawMate.Application.LawyerModule.LawyerAvailability.Commands;
using LawMate.Application.LawyerModule.LawyerAvailability.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/availability")]
public class AvailabilityController : ControllerBase
{
    private readonly IMediator _mediator;

    public AvailabilityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all availability slots for a specific lawyer with optional date filtering
    /// </summary>
    /// <param name="lawyerId">The lawyer's user ID</param>
    /// <param name="startDate">Optional start date filter (inclusive)</param>
    /// <param name="endDate">Optional end date filter (inclusive)</param>
    [Authorize]
    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetLawyerAvailabilitySlots(
        string lawyerId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var result = await _mediator.Send(new GetLawyerAvailabilitySlotsQuery(
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
                Message = "Failed to retrieve availability slots",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Create a new availability slot
    /// </summary>
    /// <param name="request">The slot details</param>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateAvailabilitySlot([FromBody] CreateAvailabilitySlotDto request)
    {
        try
        {
            var timeSlotId = await _mediator.Send(new CreateAvailabilitySlotCommand
            {
                Data = request
            });

            return Ok(new
            {
                Message = "Availability slot created successfully",
                TimeSlotId = timeSlotId,
                Id = timeSlotId.ToString()
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
        catch (ArgumentException ex)
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
                Message = "Failed to create availability slot",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Update an existing availability slot
    /// </summary>
    /// <param name="slotId">The time slot ID</param>
    /// <param name="request">The updated slot details</param>
    [Authorize]
    [HttpPut("{slotId}")]
    public async Task<IActionResult> UpdateAvailabilitySlot(
        int slotId,
        [FromBody] UpdateAvailabilitySlotDto request)
    {
        try
        {
            await _mediator.Send(new UpdateAvailabilitySlotCommand
            {
                TimeSlotId = slotId,
                Data = request
            });

            return Ok(new
            {
                Message = "Availability slot updated successfully",
                TimeSlotId = slotId
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
        catch (ArgumentException ex)
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
                Message = "Failed to update availability slot",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Delete an availability slot (only if not booked)
    /// </summary>
    /// <param name="slotId">The time slot ID</param>
    [Authorize]
    [HttpDelete("{slotId}")]
    public async Task<IActionResult> DeleteAvailabilitySlot(int slotId)
    {
        try
        {
            await _mediator.Send(new DeleteAvailabilitySlotCommand
            {
                TimeSlotId = slotId
            });

            return Ok(new
            {
                Message = "Availability slot deleted successfully",
                TimeSlotId = slotId
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
                Message = "Failed to delete availability slot",
                Error = ex.Message
            });
        }
    }
}
