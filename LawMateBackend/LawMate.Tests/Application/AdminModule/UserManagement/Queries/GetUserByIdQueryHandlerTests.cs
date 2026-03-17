using FluentAssertions;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetUserByIdQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetUserByIdQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_User_When_UserExists()
        {
            // Arrange
            _context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "U1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                NIC = "123456789V"
            });

            await _context.SaveChangesAsync();

            var handler = new GetUserByIdQueryHandler(_context);

            // Act
            var result = await handler.Handle(new GetUserByIdQuery("U1"), CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be("U1");
            result.Email.Should().Be("john@test.com");
            result.FirstName.Should().Be("John");
        }

        [Fact]
        public async Task Handle_Should_Throw_Exception_When_User_Not_Found()
        {
            // Arrange
            var handler = new GetUserByIdQueryHandler(_context);

            // Act
            Func<Task> act = async () =>
                await handler.Handle(new GetUserByIdQuery("INVALID"), CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("User not found");
        }
    }
}