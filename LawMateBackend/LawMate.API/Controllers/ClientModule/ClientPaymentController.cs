using LawMate.Application.ClientModule.ClientBookings.Commands;
using LawMate.Application.ClientModule.ClientBookings.Queries;
using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.ClientModule;

[ApiController]
[Route("api/client/payment")]
[Authorize(Roles = "Client")]
public class ClientPaymentController : ControllerBase
{
    private readonly IMediator           _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ClientPaymentController(
        IMediator           mediator,
        ICurrentUserService currentUserService)
    {
        _mediator           = mediator;
        _currentUserService = currentUserService;
    }

    private string? ClientId => _currentUserService.UserId;

    private IActionResult Unauthorized401() =>
        Unauthorized(new { message = "Client identity could not be resolved." });

    // ─── POST /api/client/payment/upload-slip ─────────────────────────────────
    // Body: { bookingId, slipImageBase64 }

    [HttpPost("upload-slip")]
    public async Task<IActionResult> UploadPaymentSlip(
        [FromBody] UploadSlipRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.SlipImageBase64))
            return BadRequest(new { message = "Slip image is required." });

        try
        {
            var paymentId = await _mediator.Send(new UploadPaymentSlipCommand
            {
                BookingId       = request.BookingId,
                SlipImageBase64 = request.SlipImageBase64,
            });

            return Ok(new
            {
                PaymentId = paymentId,
                Message   = "Payment slip uploaded successfully. Awaiting verification.",
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Upload failed.", error = ex.Message });
        }
    }

    // ─── GET /api/client/payment/slip/{bookingId} ─────────────────────────────
    // Returns the uploaded slip image (base64) for a booking.

    [HttpGet("slip/{bookingId:int}")]
    public async Task<IActionResult> GetPaymentSlip(int bookingId)
    {
        if (ClientId is null) return Unauthorized401();

        var result = await _mediator.Send(
            new GetPaymentSlipQuery(bookingId, ClientId));

        if (result is null)
            return NotFound(new { message = "No payment slip found for this booking." });

        return Ok(result);
    }
}

// ─── Request body ─────────────────────────────────────────────────────────────
public record UploadSlipRequest(int BookingId, string SlipImageBase64);