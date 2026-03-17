using FluentAssertions;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetUserRoleQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetUserRoleQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_UserRole_When_User_Exists()
        {
            // Arrange
            _context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "U1",
                UserRole = UserRole.Lawyer,
                IsDualAccount = true
            });

            await _context.SaveChangesAsync();

            var handler = new GetUserRoleQueryHandler(_context);
            var query = new GetUserRoleQuery("U1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be("U1");
            result.Role.Should().Be("Lawyer");
            result.IsDualAccount.Should().BeTrue();
        }

        [Fact]
        public async Task Handle_Should_Throw_Exception_When_User_Not_Found()
        {
            // Arrange
            var handler = new GetUserRoleQueryHandler(_context);
            var query = new GetUserRoleQuery("UNKNOWN");

            // Act
            Func<Task> act = async () =>
                await handler.Handle(query, CancellationToken.None);

            // Assert
            await act.Should()
                .ThrowAsync<KeyNotFoundException>()
                .WithMessage("User not found");
        }
    }
}