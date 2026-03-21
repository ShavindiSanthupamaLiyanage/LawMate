using LawMate.Application.LawyerModule.LawyerDashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.LawyerModule
{
    [ApiController]
    [Route("api/lawyer/dashboard")]
    [Authorize]
    public class LawyerDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public LawyerDashboardController(IMediator mediator)
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

        [HttpGet("home")]
        public async Task<IActionResult> GetDashboard()
        {
            var lawyerId = GetCurrentLawyerId();
            var result = await _mediator.Send(new GetLawyerDashboardQuery(lawyerId));
            return Ok(result);
        }
    }
}