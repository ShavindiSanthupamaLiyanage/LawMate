using LawMate.Application.LawyerModule.Availability.Commands;
using LawMate.Application.LawyerModule.Availability.Queries;
using LawMate.Domain.DTOs.Booking;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyer")]
[Authorize]
public class LawyerAvailabilityController : ControllerBase
{
    private readonly IMediator _mediator;

    public LawyerAvailabilityController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all availability slots for the logged-in lawyer.
    /// </summary>
    [HttpGet("availability")]
    public async Task<IActionResult> GetAllAvailability()
    {
        var lawyerId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(lawyerId))
            return Unauthorized();

        var result = await _mediator.Send(new GetLawyerAvailabilityQuery(lawyerId));
        return Ok(result);
    }

    /// <summary>
    /// Get all future availability slots for a specific lawyer.
    /// </summary>
    [HttpGet("{lawyerId}/availability")]
    public async Task<IActionResult> GetAvailability(string lawyerId)
    {
        var result = await _mediator.Send(new GetLawyerAvailabilityQuery(lawyerId));
        return Ok(result);
    }

    /// <summary>
    /// Get availability slots for a specific month.
    /// </summary>
    [HttpGet("{lawyerId}/availability/monthly")]
    public async Task<IActionResult> GetAvailabilityByMonth(
        string lawyerId,
        [FromQuery] int month,
        [FromQuery] int year)
    {
        if (month < 1 || month > 12)
            return BadRequest("Month must be between 1 and 12.");
        if (year < 2024)
            return BadRequest("Invalid year.");

        var result = await _mediator.Send(new GetAvailabilityByMonthQuery(lawyerId, month, year));
        return Ok(result);
    }

    /// <summary>
    /// Create a new availability slot (lawyer only).
    /// </summary>
    [HttpPost("availability")]
    public async Task<IActionResult> CreateSlot([FromBody] CreateTimeSlotDto dto)
    {
        var lawyerId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(lawyerId))
            return Unauthorized();

        var result = await _mediator.Send(new CreateTimeSlotCommand
        {
            LawyerId = lawyerId,
            Data = dto
        });

        return CreatedAtAction(nameof(GetAvailability), new { lawyerId }, result);
    }

    /// <summary>
    /// Update an existing availability slot (lawyer only).
    /// </summary>
    [HttpPatch("availability/{slotId}")]
    public async Task<IActionResult> UpdateSlot(int slotId, [FromBody] UpdateTimeSlotDto dto)
    {
        var lawyerId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(lawyerId))
            return Unauthorized();

        var result = await _mediator.Send(new UpdateTimeSlotCommand
        {
            SlotId = slotId,
            LawyerId = lawyerId,
            Data = dto
        });

        return Ok(result);
    }

    /// <summary>
    /// Delete an availability slot (lawyer only).
    /// </summary>
    [HttpDelete("availability/{slotId}")]
    public async Task<IActionResult> DeleteSlot(int slotId)
    {
        var lawyerId = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrEmpty(lawyerId))
            return Unauthorized();

        await _mediator.Send(new DeleteTimeSlotCommand
        {
            SlotId = slotId,
            LawyerId = lawyerId
        });

        return NoContent();
    }
}
