using FluentAssertions;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetActiveUsersQueryHandlerTests
    {
        private readonly IApplicationDbContext _context;

        public GetActiveUsersQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_ActiveUsers")
                .Options;

            _context = new ApplicationDbContext(options);

            // Seed test data
            _context.USER_DETAIL.AddRange(new List<USER_DETAIL>
            {
                new() { UserId = "U1", State = Domain.Common.Enums.State.Active, FirstName="John" },
                new() { UserId = "U2", State = Domain.Common.Enums.State.Inactive, FirstName="Jane" },
                new() { UserId = "U3", State = Domain.Common.Enums.State.Active, FirstName="Bob" }
            });
            _context.SaveChangesAsync(CancellationToken.None).GetAwaiter().GetResult();
        }

        [Fact]
        public async Task Handle_ShouldReturnOnlyActiveUsers()
        {
            // Arrange
            var handler = new GetActiveUsersQueryHandler(_context);
            var query = new GetActiveUsersQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().HaveCount(2);
            result.Select(u => u.UserId).Should().Contain(new[] { "U1", "U3" });
        }
    }
}