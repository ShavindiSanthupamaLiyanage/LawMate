using LawMate.Application.Common.UserDetails.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LawMate.API.Controllers.Common;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;

    public UserController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _mediator.Send(new GetAllUsersQuery()));

    [HttpGet("active")]
    public async Task<IActionResult> GetActive()
        => Ok(await _mediator.Send(new GetActiveUsersQuery()));

    [HttpGet("inactive")]
    public async Task<IActionResult> GetInactive()
        => Ok(await _mediator.Send(new GetInactiveUsersQuery()));
    
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
        => Ok(await _mediator.Send(new GetPendingUsersQuery()));

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetById(string userId)
        => Ok(await _mediator.Send(new GetUserByIdQuery(userId)));

    [HttpGet("{userId}/role")]
    public async Task<IActionResult> GetUserRole(string userId)
        => Ok(await _mediator.Send(new GetUserRoleQuery(userId)));
}
