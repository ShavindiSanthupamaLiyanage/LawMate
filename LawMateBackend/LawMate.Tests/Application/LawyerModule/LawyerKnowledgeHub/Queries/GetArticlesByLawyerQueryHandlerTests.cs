// using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries;
// using LawMate.Domain.Entities.Lawyer;
// using LawMate.Tests.Common;
// using FluentAssertions;
// using Xunit;
//
// public class GetArticlesByLawyerQueryHandlerTests
// {
//     [Fact]
//     public async Task Should_Return_Articles_For_Specific_Lawyer()
//     {
//         var context = TestDbContextFactory.Create();
//
//         context.ARTICLE.Add(new ARTICLE { Title = "A1", LawyerId = "LAW1" });
//         context.ARTICLE.Add(new ARTICLE { Title = "A2", LawyerId = "LAW2" });
//
//         await context.SaveChangesAsync();
//
//         var handler = new GetArticlesByLawyerQueryHandler(context);
//
//         var result = await handler.Handle(new GetArticlesByLawyerQuery("LAW1"), default);
//
//         result.Count.Should().Be(1);
//         result.First().LawyerId.Should().Be("LAW1");
//     }
// }