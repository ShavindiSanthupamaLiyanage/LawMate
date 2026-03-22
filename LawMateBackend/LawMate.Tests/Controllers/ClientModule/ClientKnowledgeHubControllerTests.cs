using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LawMate.API.Controllers.ClientModule;
using LawMate.Application.ClientModule.ClientKnowledgeHub.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace LawMate.Tests.API.ClientModule
{
    public class ClientKnowledgeHubControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly ClientKnowledgeHubController _controller;

        public ClientKnowledgeHubControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new ClientKnowledgeHubController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetAllArticles_Should_Return_Ok_With_Articles()
        {
            // Arrange
            var articles = new List<ArticleDto>
            {
                new ArticleDto { ArticleId = 1, Title = "Article 1", IsPublished = true },
                new ArticleDto { ArticleId = 2, Title = "Article 2", IsPublished = true }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetAllArticleQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(articles);

            // Act
            var result = await _controller.GetAllArticles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedArticles = Assert.IsAssignableFrom<List<ArticleDto>>(okResult.Value);
            Assert.Equal(2, returnedArticles.Count);
        }

        [Fact]
        public async Task GetRecentArticles_Should_Return_Ok_With_Recent_Articles()
        {
            // Arrange
            var recentArticles = new List<ArticleDto>
            {
                new ArticleDto { ArticleId = 1, Title = "Recent 1", IsPublished = true }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetRecentArticlesQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(recentArticles);

            // Act
            var result = await _controller.GetRecentArticles();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedArticles = Assert.IsAssignableFrom<List<ArticleDto>>(okResult.Value);
            Assert.Single(returnedArticles);
            Assert.Equal("Recent 1", returnedArticles[0].Title);
        }

        [Fact]
        public async Task GetAllArticles_When_Exception_Thrown_Should_Bubble_Up()
        {
            // Arrange
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetAllArticleQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new System.Exception("Mediator failure"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<System.Exception>(() => _controller.GetAllArticles());
            Assert.Equal("Mediator failure", ex.Message);
        }

        [Fact]
        public async Task GetRecentArticles_When_Exception_Thrown_Should_Bubble_Up()
        {
            // Arrange
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetRecentArticlesQuery>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new System.Exception("Mediator failure"));

            // Act & Assert
            var ex = await Assert.ThrowsAsync<System.Exception>(() => _controller.GetRecentArticles());
            Assert.Equal("Mediator failure", ex.Message);
        }
    }
}