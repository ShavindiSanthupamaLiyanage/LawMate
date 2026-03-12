using MediatR;
using Microsoft.AspNetCore.Mvc;
using LawMate.Application.ClientModule.ClientKnowledgeHub.Queries;
using Microsoft.AspNetCore.Authorization;

namespace LawMate.API.Controllers.ClientModule;

[ApiController]
[Route("api/client/knowledgehub")]
public class ClientKnowledgeHubController : ControllerBase
{
    private readonly IMediator _mediator;

    public ClientKnowledgeHubController(IMediator mediator)
    {
        _mediator = mediator;
    }
    
    [Authorize]
    [HttpGet("articles")]
    public async Task<IActionResult> GetAllArticles()
    {
        var result = await _mediator.Send(new GetAllArticleQuery());
        return Ok(result);
    }
    
    [Authorize]
    [HttpGet("recent-articles")]
    public async Task<IActionResult> GetRecentArticles()
    {
        var result = await _mediator.Send(new GetRecentArticlesQuery());
        return Ok(result);
    }
    
}