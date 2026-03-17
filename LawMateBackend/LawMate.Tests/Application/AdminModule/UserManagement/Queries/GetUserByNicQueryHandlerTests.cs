using FluentAssertions;
using LawMate.Application.Common.UserDetails.Queries;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class GetUserByNicQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetUserByNicQueryHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Return_User_When_Nic_Exists()
        {
            // Arrange
            _context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "U1",
                NIC = "123456789V",
                Email = "john@test.com"
            });

            await _context.SaveChangesAsync();

            var handler = new GetUserByNicQueryHandler(_context);

            var query = new GetUserByNicQuery
            {
                Nic = "123456789V"
            };

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Email.Should().Be("john@test.com");
        }

        [Fact]
        public async Task Handle_Should_Throw_Exception_When_Nic_Not_Found()
        {
            // Arrange
            var handler = new GetUserByNicQueryHandler(_context);

            var query = new GetUserByNicQuery
            {
                Nic = "999999999V"
            };

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