using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyer/finance")]
[Authorize]
public class LawyerFinanceController : ControllerBase
{
    private readonly IMediator _mediator;

    public LawyerFinanceController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("overview/{lawyerId}")]
    public async Task<IActionResult> GetOverview(string lawyerId)
    {
        var result = await _mediator.Send(new GetLawyerFinanceOverviewQuery(lawyerId));
        return Ok(result);
    }
    [HttpGet("transactions/{lawyerId}")]
    public async Task<IActionResult> GetTransactions(
        string lawyerId,
        [FromQuery] string? search,
        [FromQuery] VerificationStatus? status)
    {
        var result = await _mediator.Send(
            new GetLawyerFinanceTransactionsQuery(lawyerId, search, status));

        return Ok(result);
    }
}