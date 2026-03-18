// using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries;
// using LawMate.Domain.Entities.Lawyer;
// using LawMate.Tests.Common;
// using FluentAssertions;
// using Xunit;
//
// public class GetAllArticlesQueryHandlerTests
// {
//     [Fact]
//     public async Task Should_Return_All_Articles()
//     {
//         var context = TestDbContextFactory.Create();
//
//         context.ARTICLE.Add(new ARTICLE { Title = "A1", LawyerId="LAW1" });
//         context.ARTICLE.Add(new ARTICLE { Title = "A2", LawyerId="LAW2" });
//
//         await context.SaveChangesAsync();
//
//         var handler = new GetAllArticlesQueryHandler(context);
//
//         var result = await handler.Handle(new GetAllArticlesQuery(), default);
//
//         result.Count.Should().Be(2);
//     }
// }