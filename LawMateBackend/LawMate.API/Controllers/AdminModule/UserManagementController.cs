using LawMate.Application.AdminModule.UserManagement.Queries;
using LawMate.Application.Common.UserDetails.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.AdminModule;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllUsersQuery()));

    [Authorize]
    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
        => Ok(await _mediator.Send(new GetActiveUsersQuery()));

    [Authorize]
    [HttpGet("inactive")]
    public async Task<IActionResult> GetInactive()
        => Ok(await _mediator.Send(new GetInactiveUsersQuery()));
    
    [Authorize]
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
        => Ok(await _mediator.Send(new GetPendingUsersQuery()));

    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetById(string userId)
        => Ok(await _mediator.Send(new GetUserByIdQuery(userId)));
    
    [HttpGet("{nic}/email")]
    public async Task<IActionResult> GetByNic(string nic)
        => Ok(await _mediator.Send(new GetUserByNicQuery { Nic = nic }));

    [Authorize]
    [HttpGet("{userId}/role")]
    public async Task<IActionResult> GetUserRole(string userId)
        => Ok(await _mediator.Send(new GetUserRoleQuery(userId)));
    
    [Authorize]
    [HttpGet("counts")]
    public async Task<IActionResult> GetUserCounts()
        => Ok(await _mediator.Send(new GetUserCountsQuery()));
}
