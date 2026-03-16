using FluentAssertions;
using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Command
{
    public class DeleteLawyerCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public DeleteLawyerCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_Should_Delete_User_And_Lawyer_When_Both_Exist()
        {
            // Arrange
            var userId = "U1";

            var user = new USER_DETAIL { UserId = userId };
            var lawyer = new LAWYER_DETAILS { UserId = userId };

            _context.USER_DETAIL.Add(user);
            _context.LAWYER_DETAILS.Add(lawyer);
            await _context.SaveChangesAsync();

            var command = new DeleteLawyerCommand(userId);
            var handler = new DeleteLawyerCommandHandler(_context);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            var userFromDb = await _context.USER_DETAIL.FirstOrDefaultAsync(x => x.UserId == userId);
            var lawyerFromDb = await _context.LAWYER_DETAILS.FirstOrDefaultAsync(x => x.UserId == userId);

            userFromDb.Should().BeNull();
            lawyerFromDb.Should().BeNull();
        }

        [Fact]
        public async Task Handle_Should_Delete_User_When_Lawyer_Does_Not_Exist()
        {
            // Arrange
            var userId = "U2";

            var user = new USER_DETAIL { UserId = userId };

            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            var command = new DeleteLawyerCommand(userId);
            var handler = new DeleteLawyerCommandHandler(_context);

            // Act
            await handler.Handle(command, CancellationToken.None);

            // Assert
            var userFromDb = await _context.USER_DETAIL.FirstOrDefaultAsync(x => x.UserId == userId);

            userFromDb.Should().BeNull();
        }

        [Fact]
        public async Task Handle_Should_Not_Throw_When_User_And_Lawyer_Do_Not_Exist()
        {
            // Arrange
            var command = new DeleteLawyerCommand("UnknownUser");
            var handler = new DeleteLawyerCommandHandler(_context);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().NotThrowAsync();
        }
    }
}