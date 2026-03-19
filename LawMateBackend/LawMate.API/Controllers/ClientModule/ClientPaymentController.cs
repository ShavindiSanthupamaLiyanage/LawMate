
using LawMate.Application.ClientModule.ClientBookings.Commands;
using LawMate.Application.ClientModule.ClientBookings.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.ClientModule;

[ApiController]
[Route("api/client/payment")]
[Authorize(Roles = "Client")]
public class ClientPaymentController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ClientPaymentController(
        IMediator mediator,
        ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Get appointment details for the detail screen.
    /// GET /api/client/payment/appointment/{bookingId}
    /// </summary>
    [HttpGet("appointment/{bookingId:int}")]
    public async Task<IActionResult> GetAppointmentDetail(int bookingId)
    {
        var clientId = _currentUserService.UserId;
        if (string.IsNullOrEmpty(clientId))
            return Unauthorized();

        var result = await _mediator.Send(
            new GetAppointmentDetailQuery(bookingId, clientId));

        if (result is null)
            return NotFound(new { Message = $"Booking {bookingId} not found." });

        return Ok(result);
    }

    /// <summary>
    /// Upload payment slip for an accepted booking.
    /// POST /api/client/payment/upload-slip
    /// Body: { bookingId, slipNumber, transactionId, amount, slipImageBase64 }
    /// </summary>
    [HttpPost("upload-slip")]
    public async Task<IActionResult> UploadPaymentSlip([FromBody] UploadPaymentSlipDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var paymentId = await _mediator.Send(
            new UploadPaymentSlipCommand { Data = dto });

        return Ok(new
        {
            PaymentId = paymentId,
            Message   = "Payment slip uploaded successfully. Awaiting lawyer verification."
        });
    }
}