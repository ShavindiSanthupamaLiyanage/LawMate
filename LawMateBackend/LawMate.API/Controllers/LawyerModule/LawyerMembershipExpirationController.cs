using LawMate.Application.LawyerMembership.Queries.GetMembershipReminder;
using LawMate.Application.MembershipModule.Commands.ExpireMembership;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule
{
    [ApiController]
    [Route("api/[controller]")]
    public class LawyerMembershipExpirationController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LawyerMembershipExpirationController(IMediator mediator)
        {
            _mediator = mediator;
        }
        
        [HttpPost("expire")]
        public async Task<IActionResult> ExpireMemberships()
        {
            await _mediator.Send(new ExpireMembershipCommand());
            return Ok(new { message = "Expired memberships processed successfully." });
        }
        
        [HttpGet("reminders")]
        public async Task<IActionResult> GetExpiringMemberships()
        {
            var result = await _mediator.Send(new GetMembershipReminder());
            return Ok(result);
        }
    }
}