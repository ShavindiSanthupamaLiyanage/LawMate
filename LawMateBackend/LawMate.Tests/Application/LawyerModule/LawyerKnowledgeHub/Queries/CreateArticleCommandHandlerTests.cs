// using FluentAssertions;
// using LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command;
// using LawMate.Domain.DTOs;
// using LawMate.Tests.Common;
//
// namespace LawMate.Tests.Application.LawyerModule.LawyerKnowledgeHub.Queries;
//
// public class CreateArticleCommandHandlerTests
// {
//     [Fact]
//     public async Task Should_Create_Article()
//     {
//         var context = TestDbContextFactory.Create();
//         var handler = new CreateArticleCommandHandler(context);
//
//         var dto = new ArticleDto
//         {
//             LawyerId = "LAW001",
//             Title = "Test Article",
//             Content = "Test Content",
//             LegalCategory = "1",
//             Language = "1",
//             IsPublished = true,
//             CreatedBy = "LAW001",
//             LikeCount = 0
//         };
//
//         var command = new CreateArticleCommand(dto);
//
//         var result = await handler.Handle(command, default);
//
//         result.Should().NotBeNull();
//         result.Title.Should().Be("Test Article");
//
//         context.ARTICLE.Count().Should().Be(1);
//     }
// }