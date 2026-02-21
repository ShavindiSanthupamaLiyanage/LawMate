using LawMate.Application.AdminModule.LawyerVerification;
using LawMate.Application.AdminModule.LawyerVerification.Commands;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule;

[ApiController]
[Route("api/lawyer-verification")]
[Authorize]
public class LawyerVerificationController : ControllerBase
{
    private readonly IMediator _mediator;
    public LawyerVerificationController(IMediator mediator)
    {
        _mediator = mediator;
    }
    [HttpGet("pending")] public async Task<IActionResult> GetPending()
    {
        return Ok(await _mediator.Send(
            new GetLawyersByVerificationStatusQuery 
            { 
                VerificationStatus = VerificationStatus.Pending 
            }));
    }
    
    [HttpGet("verified")] public async Task<IActionResult> GetVerified()
    {
        return Ok(await _mediator.Send(
            new GetLawyersByVerificationStatusQuery 
            { 
                VerificationStatus = VerificationStatus.Verified 
            }));
    }
    
    [HttpGet("rejected")] public async Task<IActionResult> GetRejected()
    {
        return Ok(await _mediator.Send(
            new GetLawyersByVerificationStatusQuery 
            { 
                VerificationStatus = VerificationStatus.Rejected 
            }));
    }
    
    [HttpGet("active")] public async Task<IActionResult> GetActive()
    {
        return Ok(await _mediator.Send(
            new GetLawyersByVerificationStatusQuery 
            { 
                State = State.Active 
            }));
    }
    
    [HttpGet("inactive")] public async Task<IActionResult> GetInactive()
    {
        return Ok(await _mediator.Send(
            new GetLawyersByVerificationStatusQuery 
            { 
                State = State.Inactive 
            }));
    }
    
    [HttpPost("{userId}/accept")] public async Task<IActionResult> Accept(string userId)
    {
        var adminId = User.Identity.Name;
        return Ok(await _mediator.Send(
            new AcceptLawyerVerificationCommand
            {
                UserId = userId, AdminUserId = adminId
            }));
    }
    
    [HttpPost("{userId}/reject")] public async Task<IActionResult> Reject(
        string userId,
        [FromBody] string reason)
    {
        var adminId = User.Identity.Name;
        return Ok(await _mediator.Send(
            new RejectLawyerVerificationCommand
            {
                UserId = userId, AdminUserId = adminId, RejectedReason = reason
            }));
    }
}

