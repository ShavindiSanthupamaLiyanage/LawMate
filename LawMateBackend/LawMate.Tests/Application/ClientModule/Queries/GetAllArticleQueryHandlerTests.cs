using LawMate.Application.ClientModule.ClientKnowledgeHub.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.ClientModule.Queries;

public class ClientKnowledgeHubQueryHandlerTests
{
    private IApplicationDbContext GetContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new ApplicationDbContext(options);
    }

    [Fact]
    public async Task GetAllArticleQueryHandler_Should_Return_Only_Published_Articles()
    {
        // Arrange
        var context = GetContext(nameof(GetAllArticleQueryHandler_Should_Return_Only_Published_Articles));

        var articles = new List<ARTICLE>
        {
            new ARTICLE
            {
                ArticleId = 1,
                Title = "Published 1",
                Content = "Content 1",
                LawyerId = "LAW1",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                Language = Language.English,
                LegalCategory = LegalCategory.FamilyLaw
            },
            new ARTICLE
            {
                ArticleId = 2,
                Title = "Unpublished",
                Content = "Content 2",
                LawyerId = "LAW1",
                IsPublished = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System",
                Language = Language.English,
                LegalCategory = LegalCategory.CriminalLaw
            },
            new ARTICLE
            {
                ArticleId = 3,
                Title = "Published 2",
                Content = "Content 3",
                LawyerId = "LAW1",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddMinutes(-10),
                CreatedBy = "System",
                Language = Language.English,
                LegalCategory = LegalCategory.PropertyLaw
            }
        };

        context.ARTICLE.AddRange(articles);
        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetAllArticleQueryHandler(context);
        var query = new GetAllArticleQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, a => Assert.True(a.IsPublished));
        Assert.Contains(result, a => a.Title == "Published 1");
        Assert.Contains(result, a => a.Title == "Published 2");

        // Ensure newest first
        Assert.True(result[0].CreatedAt >= result[1].CreatedAt);
    }

    [Fact]
    public async Task GetRecentArticlesQueryHandler_Should_Return_Recent_Published_Articles()
    {
        // Arrange
        var context = GetContext(nameof(GetRecentArticlesQueryHandler_Should_Return_Recent_Published_Articles));

        var articles = new List<ARTICLE>
        {
            new ARTICLE
            {
                ArticleId = 1,
                Title = "Recent Published",
                Content = "Content 1",
                LawyerId = "LAW1",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                CreatedBy = "System",
                Language = Language.English,
                LegalCategory = LegalCategory.FamilyLaw
            },
            new ARTICLE
            {
                ArticleId = 2,
                Title = "Old Published",
                Content = "Content 2",
                LawyerId = "LAW1",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                CreatedBy = "System",
                Language = Language.English,
                LegalCategory = LegalCategory.CriminalLaw
            },
            new ARTICLE
            {
                ArticleId = 3,
                Title = "Recent Unpublished",
                Content = "Content 3",
                LawyerId = "LAW1",
                IsPublished = false,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                CreatedBy = "System",
                Language = Language.English,
                LegalCategory = LegalCategory.PropertyLaw
            }
        };

        context.ARTICLE.AddRange(articles);
        await context.SaveChangesAsync(CancellationToken.None);

        var handler = new GetRecentArticlesQueryHandler(context);
        var query = new GetRecentArticlesQuery();

        // Act
        var result = await handler.Handle(query, CancellationToken.None);

        // Assert
        Assert.Single(result);
        var article = result.First();
        Assert.Equal("Recent Published", article.Title);
        Assert.True(article.IsPublished);
        Assert.True(article.CreatedAt >= DateTime.UtcNow.AddDays(-7));
    }
}