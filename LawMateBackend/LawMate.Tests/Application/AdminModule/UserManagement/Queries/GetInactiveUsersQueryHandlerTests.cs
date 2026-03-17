using FluentAssertions;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetInactiveUsersQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetInactiveUsersQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_Only_Inactive_Users()
        {
            // Arrange
            _context.USER_DETAIL.AddRange(new List<USER_DETAIL>
            {
                new()
                {
                    UserId = "U1",
                    FirstName = "John",
                    Email = "john@test.com",
                    State = Domain.Common.Enums.State.Active
                },
                new()
                {
                    UserId = "U2",
                    FirstName = "Jane",
                    Email = "jane@test.com",
                    State = Domain.Common.Enums.State.Inactive
                },
                new()
                {
                    UserId = "U3",
                    FirstName = "Bob",
                    Email = "bob@test.com",
                    State = Domain.Common.Enums.State.Inactive
                }
            });

            await _context.SaveChangesAsync();

            var handler = new GetInactiveUsersQueryHandler(_context);

            // Act
            var result = await handler.Handle(new GetInactiveUsersQuery(), CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            result.Select(x => x.UserId)
                  .Should().Contain(new[] { "U2", "U3" });

            result.Select(x => x.Email)
                  .Should().Contain(new[] { "jane@test.com", "bob@test.com" });
        }
    }
}