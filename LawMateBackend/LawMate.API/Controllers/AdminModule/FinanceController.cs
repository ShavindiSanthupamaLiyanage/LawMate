using LawMate.Application.AdminModule.FinanceVerification.Commands;
using LawMate.Application.AdminModule.FinanceVerification.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule;

[Route("api/admin/finance")]
[ApiController]
[Authorize]
public class FinanceController : ControllerBase
{
    private readonly IMediator _mediator;

    public FinanceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllFinance()
    {
        var result = await _mediator.Send(new GetAllFinanceQuery());
        return Ok(result);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingFinance()
    {
        var result = await _mediator.Send(new GetPendingFinanceQuery());
        return Ok(result);
    }

    [HttpGet("paid")]
    public async Task<IActionResult> GetPaidFinance()
    {
        var result = await _mediator.Send(new GetPaidFinanceQuery());
        return Ok(result);
    }
    
    [HttpPost("approve/{bookingId}")]
    public async Task<IActionResult> ApproveFinance(int bookingId)
    {
        var result = await _mediator.Send(
            new ApproveFinancePaymentCommand(bookingId, User.Identity?.Name ?? "Admin")
        );

        return Ok(result);
    }

    [HttpPost("reject/{bookingId}")]
    public async Task<IActionResult> RejectFinance(int bookingId, [FromBody] string reason)
    {
        var result = await _mediator.Send(
            new RejectFinancePaymentCommand(
                bookingId,
                reason,
                User.Identity?.Name ?? "Admin"
            )
        );

        return Ok(result);
    }
}