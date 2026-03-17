using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries;
using LawMate.Domain.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyers/knowledgehub")]
[Authorize]
public class LawyerKnowledgeHubController : ControllerBase
{
    private readonly IMediator _mediator;

    public LawyerKnowledgeHubController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("articles")]
    public async Task<IActionResult> GetAllArticles()
    {
        var result = await _mediator.Send(new GetAllArticlesQuery());
        return Ok(result);
    }

    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetArticlesByLawyer(string lawyerId)
    {
        var result = await _mediator.Send(new GetArticlesByLawyerQuery(lawyerId));
        return Ok(result);
    }

    [HttpPost("create")]
    public async Task<IActionResult> CreateArticle([FromBody] CreateArticleDto dto)
    {
        var lawyerId = User.FindFirst("UserId")?.Value;
        var lawyerName = User.FindFirst("Email")?.Value ?? "Unknown";

        if (string.IsNullOrEmpty(lawyerId))
            return BadRequest("Cannot identify logged-in lawyer.");

        var result = await _mediator.Send(
            new CreateArticleCommand(dto, lawyerId, lawyerName)
        );

        return CreatedAtAction(nameof(GetArticlesByLawyer), new { lawyerId = result.LawyerId }, result);
    }

    [HttpPut("update/{articleId:int}")]
    public async Task<IActionResult> UpdateArticle(int articleId, [FromBody] ArticleDto articleDto)
    {
        var result = await _mediator.Send(new UpdateArticleCommand(articleId, articleDto));
        return Ok(result);
    }

    [HttpDelete("delete/{articleId:int}")]
    public async Task<IActionResult> DeleteArticle(int articleId)
    {
        var result = await _mediator.Send(new DeleteArticleCommand(articleId));
        return result ? NoContent() : NotFound();
    }
}   