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
    [Authorize]
    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetLawyerAvailabilitySlots(
        string lawyerId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate   = null)
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
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to retrieve availability slots",
                Error   = ex.Message
            });
        }
    }

    /// <summary>
    /// Get a single availability slot by ID
    /// </summary>
    [Authorize]
    [HttpGet("slots/{slotId:int}")]
    public async Task<IActionResult> GetAvailabilitySlotById(int slotId)
    {
        try
        {
            var result = await _mediator.Send(new GetAvailabilitySlotByIdQuery(slotId));
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to retrieve slot",
                Error   = ex.Message
            });
        }
    }

    /// <summary>
    /// Create a new availability slot
    /// </summary>
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
                Message    = "Availability slot created successfully",
                TimeSlotId = timeSlotId,
                Id         = timeSlotId.ToString()
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
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to create availability slot",
                Error   = ex.Message
            });
        }
    }

    /// <summary>
    /// Update an existing availability slot
    /// </summary>
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
                Data       = request
            });

            return Ok(new
            {
                Message    = "Availability slot updated successfully",
                TimeSlotId = slotId
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
        catch (ArgumentException ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Message = "Failed to update availability slot",
                Error   = ex.Message
            });
        }
    }

    /// <summary>
    /// Delete an availability slot (only if not booked)
    /// </summary>
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
                Message    = "Availability slot deleted successfully",
                TimeSlotId = slotId
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
            return BadRequest(new
            {
                Message = "Failed to delete availability slot",
                Error   = ex.Message
            });
        }
    }
}