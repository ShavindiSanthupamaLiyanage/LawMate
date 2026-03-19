using LawMate.Application.LawyerModule.LawyerEvent.Commands;
using LawMate.Application.LawyerModule.LawyerEvent.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyer-events")]
public class LawyerEventController : ControllerBase
{
    private readonly IMediator _mediator;

    public LawyerEventController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all custom calendar events for a specific lawyer with optional date filtering
    /// </summary>
    [Authorize]
    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetLawyerEvents(
        string lawyerId,
        [FromQuery] DateTime? startDate = null,
        [FromQuery] DateTime? endDate = null)
    {
        try
        {
            var result = await _mediator.Send(new GetLawyerEventsQuery(
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
                Message = "Failed to retrieve lawyer events",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Create a new custom calendar event for a lawyer
    /// </summary>
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateLawyerEvent([FromBody] CreateLawyerEventDto request)
    {
        try
        {
            var eventId = await _mediator.Send(new CreateLawyerEventCommand
            {
                Data = request
            });

            return Ok(new
            {
                Message = "Event created successfully",
                EventId = eventId,
                EventCode = $"EVT-{eventId:D4}"
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
                Message = "Failed to create event",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Update an existing custom calendar event
    /// </summary>
    [Authorize]
    [HttpPut("{eventId}")]
    public async Task<IActionResult> UpdateLawyerEvent(int eventId, [FromBody] UpdateLawyerEventDto request)
    {
        try
        {
            var result = await _mediator.Send(new UpdateLawyerEventCommand
            {
                EventId = eventId,
                Data = request
            });

            return Ok(new
            {
                Message = "Event updated successfully",
                Success = result
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
                Message = "Failed to update event",
                Error = ex.Message
            });
        }
    }

    /// <summary>
    /// Delete a custom calendar event
    /// </summary>
    [Authorize]
    [HttpDelete("{eventId}")]
    public async Task<IActionResult> DeleteLawyerEvent(int eventId)
    {
        try
        {
            var result = await _mediator.Send(new DeleteLawyerEventCommand
            {
                EventId = eventId
            });

            return Ok(new
            {
                Message = "Event deleted successfully",
                Success = result
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
                Message = "Failed to delete event",
                Error = ex.Message
            });
        }
    }
}
