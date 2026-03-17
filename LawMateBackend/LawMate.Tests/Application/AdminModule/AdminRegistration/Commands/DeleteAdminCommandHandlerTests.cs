using FluentAssertions;
using LawMate.Application.AdminModule.AdminRegistration.Commands;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.AdminModule
{
    public class DeleteAdminCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public DeleteAdminCommandHandlerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Delete_Admin_When_Exists()
        {
            // Arrange
            var admin = new USER_DETAIL
            {
                UserId = "A1",
                RecordStatus = 1
            };

            _context.USER_DETAIL.Add(admin);
            await _context.SaveChangesAsync();

            var handler = new DeleteAdminCommandHandler(_context);
            var command = new DeleteAdminCommand("A1");

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();

            var updatedAdmin = await _context.USER_DETAIL
                .FirstOrDefaultAsync(x => x.UserId == "A1");

            updatedAdmin.Should().NotBeNull();
            updatedAdmin!.RecordStatus.Should().Be(0); 
        }

        [Fact]
        public async Task Handle_Should_Throw_Exception_When_Admin_Not_Found()
        {
            // Arrange
            var handler = new DeleteAdminCommandHandler(_context);
            var command = new DeleteAdminCommand("NOT_EXIST");

            // Act
            Func<Task> act = async () =>
                await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should()
                .ThrowAsync<Exception>()
                .WithMessage("Admin not found");
        }
    }
}