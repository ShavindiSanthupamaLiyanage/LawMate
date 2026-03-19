using LawMate.Application.ClientModule.ClientDashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.ClientModule
{
    [ApiController]
    [Route("api/client/dashboard")]
    [Authorize]
    public class ClientDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ClientDashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        private string GetCurrentClientId()
        {
            var clientId = User.FindFirst("UserId")?.Value;

            if (string.IsNullOrWhiteSpace(clientId))
                throw new Exception("Unable to identify current client");

            return clientId;
        }

        [HttpGet("home")]
        public async Task<IActionResult> GetDashboardHome()
        {
            var clientId = GetCurrentClientId();
            var result = await _mediator.Send(new GetClientDashboardHomeQuery(clientId));
            return Ok(result);
        }

        [HttpGet("activity")]
        public async Task<IActionResult> GetActivityList()
        {
            var clientId = GetCurrentClientId();
            var result = await _mediator.Send(new GetClientActivityListQuery(clientId));
            return Ok(result);
        }
    }
}