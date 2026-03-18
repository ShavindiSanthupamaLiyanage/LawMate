using LawMate.Application.AdminModule.AdminDashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule
{
    [Authorize]
    [ApiController]
    [Route("api/admin-dashboard")]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AdminDashboardController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboard()
        {
            var result = await _mediator.Send(new GetAdminDashboardQuery());
            return Ok(result);
        }
    }
}