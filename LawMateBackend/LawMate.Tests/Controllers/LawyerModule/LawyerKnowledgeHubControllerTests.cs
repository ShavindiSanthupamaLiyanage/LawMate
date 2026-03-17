using LawMate.API.Controllers.LawyerModule;
using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

public class LawyerKnowledgeHubControllerTests
{
    private readonly Mock<IMediator> _mediator;
    private readonly LawyerKnowledgeHubController _controller;

    public LawyerKnowledgeHubControllerTests()
    {
        _mediator = new Mock<IMediator>();
        _controller = new LawyerKnowledgeHubController(_mediator.Object);
    }

    [Fact]
    public async Task GetAllArticles_Should_Return_Ok()
    {
        _mediator
            .Setup(m => m.Send(It.IsAny<GetAllArticlesQuery>(), default))
            .ReturnsAsync(new List<ArticleDto>());

        var result = await _controller.GetAllArticles();

        Assert.IsType<OkObjectResult>(result);
    }
}