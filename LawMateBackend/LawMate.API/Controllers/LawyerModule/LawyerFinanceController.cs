using LawMate.Application.LawyerModule.LawyerFinance.Queries;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    private string GetCurrentLawyerId()
    {
        var lawyerId = User.FindFirst("UserId")?.Value;

        if (string.IsNullOrWhiteSpace(lawyerId))
            throw new Exception("Unable to identify current lawyer");

        return lawyerId;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        var lawyerId = GetCurrentLawyerId();
        var result = await _mediator.Send(new GetLawyerFinanceOverviewQuery(lawyerId));
        return Ok(result);
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] string? search,
        [FromQuery] VerificationStatus? status)
    {
        var lawyerId = GetCurrentLawyerId();

        var result = await _mediator.Send(
            new GetLawyerFinanceTransactionsQuery(lawyerId, search, status));

        return Ok(result);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var lawyerId = GetCurrentLawyerId();
        var result = await _mediator.Send(new GetLawyerFinanceDashboardQuery(lawyerId));
        return Ok(result);
    }
    [HttpGet("report")]
    public async Task<IActionResult> GetReport(
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate,
        [FromQuery] string? preset)
    {
        var lawyerId = GetCurrentLawyerId();

        var result = await _mediator.Send(
            new GetLawyerEarningsReportQuery(lawyerId, startDate, endDate, preset));

        return Ok(result);
    }
}