using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Tests.Common;
using FluentAssertions;
using Xunit;

public class DeleteArticleCommandHandlerTests
{
    [Fact]
    public async Task Should_Delete_Article()
    {
        var context = TestDbContextFactory.Create();

        var article = new ARTICLE
        {
            ArticleId = 1,
            LawyerId = "LAW001",
            Title = "Test"
        };

        context.ARTICLE.Add(article);
        await context.SaveChangesAsync();

        var handler = new DeleteArticleCommandHandler(context);

        var result = await handler.Handle(new DeleteArticleCommand(1), default);

        result.Should().BeTrue();
        context.ARTICLE.Count().Should().Be(0);
    }
}