using LawMate.Application.AdminModule.Bookings.Queries;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminBookingController : ControllerBase
{
    private readonly IMediator _mediator;

    public AdminBookingController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all bookings with optional filters (admin dashboard).
    /// </summary>
    [HttpGet("bookings")]
    public async Task<IActionResult> GetAllBookings(
        [FromQuery] BookingStatus? status,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var result = await _mediator.Send(new GetAllBookingsQuery
        {
            StatusFilter = status,
            PaymentStatusFilter = paymentStatus,
            FromDate = fromDate,
            ToDate = toDate
        });

        return Ok(result);
    }

    /// <summary>
    /// Get all payment records for admin verification/review.
    /// </summary>
    [HttpGet("payments")]
    public async Task<IActionResult> GetAllPayments(
        [FromQuery] VerificationStatus? status)
    {
        var result = await _mediator.Send(new GetAllPaymentsQuery
        {
            StatusFilter = status
        });

        return Ok(result);
    }
}
