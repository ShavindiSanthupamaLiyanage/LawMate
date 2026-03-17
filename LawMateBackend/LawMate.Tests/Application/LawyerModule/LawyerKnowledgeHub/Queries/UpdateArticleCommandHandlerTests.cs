using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Domain.DTOs;
using LawMate.Tests.Common;
using FluentAssertions;
using Xunit;

public class UpdateArticleCommandHandlerTests
{
    [Fact]
    public async Task Should_Update_Article()
    {
        var context = TestDbContextFactory.Create();

        var article = new ARTICLE
        {
            ArticleId = 1,
            LawyerId = "LAW001",
            Title = "Old Title",
            Content = "Old Content"
        };

        context.ARTICLE.Add(article);
        await context.SaveChangesAsync();

        var handler = new UpdateArticleCommandHandler(context);

        var dto = new ArticleDto
        {
            Title = "Updated Title",
            Content = "Updated Content",
            LegalCategory = "1",
            Language = "1",
            IsPublished = true,
            ModifiedBy = "LAW001"
        };

        var command = new UpdateArticleCommand(1, dto);

        var result = await handler.Handle(command, default);

        result.Title.Should().Be("Updated Title");
    }
}