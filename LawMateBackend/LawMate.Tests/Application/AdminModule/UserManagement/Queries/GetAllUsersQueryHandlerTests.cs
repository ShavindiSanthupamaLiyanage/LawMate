using FluentAssertions;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetAllUsersQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetAllUsersQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_All_Users()
        {
            // Arrange
            _context.USER_DETAIL.AddRange(new List<USER_DETAIL>
            {
                new()
                {
                    UserId = "U1",
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john@test.com"
                },
                new()
                {
                    UserId = "U2",
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane@test.com"
                }
            });

            await _context.SaveChangesAsync();

            var handler = new GetAllUsersQueryHandler(_context);

            // Act
            var result = await handler.Handle(new GetAllUsersQuery(), CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);

            result.Select(x => x.UserId)
                .Should().Contain(new[] { "U1", "U2" });

            result.Select(x => x.Email)
                .Should().Contain(new[] { "john@test.com", "jane@test.com" });
        }
    }
}