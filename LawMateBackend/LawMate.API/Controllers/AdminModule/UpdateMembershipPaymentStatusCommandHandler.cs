using LawMate.Application.AdminModule.PaymentMaintenance.Commands;
using LawMate.Application.AdminModule.PaymentMaintenance.Queries;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using LawMate.Application.AdminModule.PaymentMaintenance.Commands;

namespace LawMate.API.Controllers.AdminModule;

[ApiController]
[Route("api/admin/payments")]
[Authorize]
public class UpdateMembershipPaymentStatusCommandHandler : ControllerBase
{
    private readonly IMediator _mediator;

    public UpdateMembershipPaymentStatusCommandHandler(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllPayments()
    {
        var result = await _mediator.Send(new GetPaymentsQuery());
        return Ok(result);
    }
    
    [HttpGet("details")]
    public async Task<IActionResult> GetPaymentDetails(
        [FromQuery] string lawyerId,
        [FromQuery] string type,
        [FromQuery] string? clientId)
    {
        var result = await _mediator.Send(new GetPaymentByIdQuery
        {
            LawyerId = lawyerId,
            PaymentType = type,
            ClientId = clientId
        });

        return Ok(result);
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingPayments()
    {
        var result = await _mediator.Send(new GetPaymentsQuery
        {
            Status = VerificationStatus.Pending
        });

        return Ok(result);
    }

    [HttpGet("accepted")]
    public async Task<IActionResult> GetAcceptedPayments()
    {
        var result = await _mediator.Send(new GetPaymentsQuery
        {
            Status = VerificationStatus.Verified
        });

        return Ok(result);
    }

    [HttpGet("rejected")]
    public async Task<IActionResult> GetRejectedPayments()
    {
        var result = await _mediator.Send(new GetPaymentsQuery
        {
            Status = VerificationStatus.Rejected
        });

        return Ok(result);
    }

    [HttpPost("membership/update")]
    public async Task<IActionResult> UpdateMembershipPayment(UpdateMembershipPaymentStatusCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpPost("booking/update")]
    public async Task<IActionResult> UpdateBookingPayment(UpdateBookingPaymentStatusCommand command)
    {
        var result = await _mediator.Send(command);
        return Ok(result);
    }
    
    [HttpPost("booking/{paymentId}/mark-paid")]
    public async Task<IActionResult> MarkBookingPaymentAsPaid(int paymentId)
    {
        var result = await _mediator.Send(new MarkBookingPaymentAsPaidCommand
        {
            PaymentId = paymentId
        });

        return Ok(result);
    }
}