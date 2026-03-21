using FluentAssertions;
using LawMate.Application.AdminModule.UserManagement.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetUserCountsQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetUserCountsQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_Correct_User_Counts()
        {
            // Arrange
            _context.USER_DETAIL.AddRange(new List<USER_DETAIL>
            {
                // Lawyers
                new() { UserId="L1", UserRole = UserRole.Lawyer, State = State.AllVerified },
                new() { UserId="L2", UserRole = UserRole.Lawyer, State = State.Pending },
                new() { UserId="L3", UserRole = UserRole.Lawyer, State = State.Inactive },
                new() { UserId="L4", UserRole = UserRole.Lawyer, State = State.Active },

                // Clients
                new() { UserId="C1", UserRole = UserRole.Client, State = State.Active },
                new() { UserId="C2", UserRole = UserRole.Client, State = State.Inactive }
            });

            await _context.SaveChangesAsync();

            var handler = new GetUserCountsQueryHandler(_context);
            var query = new GetUserCountsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();

            result.VerifiedLawyers.Should().Be(1);
            result.PendingLawyers.Should().Be(1);
            result.InactiveLawyers.Should().Be(1);
            result.ActiveLawyers.Should().Be(1);

            result.ActiveClients.Should().Be(1);
            result.InactiveClients.Should().Be(1);
        }
    }
}