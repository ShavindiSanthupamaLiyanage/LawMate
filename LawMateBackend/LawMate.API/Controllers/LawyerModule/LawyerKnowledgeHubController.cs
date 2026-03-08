using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries;
using LawMate.Domain.DTOs;
using Microsoft.AspNetCore.Authorization;

namespace LawMate.API.Controllers.LawyerModule;

[ApiController]
[Route("api/lawyers/knowledgehub")]
public class LawyerKnowledgeHubController : ControllerBase
{
    private readonly IMediator _mediator;

    public LawyerKnowledgeHubController(IMediator mediator)
    {
        _mediator = mediator;
    }

    //Get all articles 
    [Authorize]
    [HttpGet("articles")]
    public async Task<IActionResult> GetAllArticles()
    {
        var result = await _mediator.Send(new GetAllArticlesQuery());
        return Ok(result);
    }

    //Get the articles which related to a specific lawyer
    [Authorize]
    [HttpGet("lawyer/{lawyerId}")]
    public async Task<IActionResult> GetArticlesByLawyer(string lawyerId)
    {
        var result = await _mediator.Send(new GetArticlesByLawyerQuery(lawyerId));
        return Ok(result);
    }
    
    //Create a new article
    [Authorize]
    [HttpPost("create")]
    public async Task<IActionResult> CreateArticle([FromBody] ArticleDto articleDto)
    {
        var result = await _mediator.Send(new CreateArticleCommand(articleDto));
        return CreatedAtAction(nameof(GetArticlesByLawyer), new { lawyerId = result.LawyerId }, result);
    }
    
    //Update an existing article
    [Authorize]
    [HttpPut("update/{articleId:int}")]
    public async Task<IActionResult> UpdateArticle(int articleId, [FromBody] ArticleDto articleDto)
    {
        var result = await _mediator.Send(new UpdateArticleCommand(articleId, articleDto));
        return Ok(result);
    }
    
    //Delete an existing article
    [Authorize]
    [HttpDelete("delete/{articleId:int}")]
    public async Task<IActionResult> DeleteArticle(int articleId)
    {
        var result = await _mediator.Send(new DeleteArticleCommand(articleId));
        return result ? NoContent() : NotFound();
    }
}