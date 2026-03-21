using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.ClientModule.ClientRegistration.Commands
{
    public class SuspendClientCommandHandlerTests
    {
        [Fact]
        public async Task Handle_ShouldThrowException_WhenUserNotFound()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldThrowException_WhenUserNotFound));
            var command = new SuspendClientCommand
            {
                UserId = "NonExistentUser",
                SuspendedBy = "Admin",
                SuspendedReason = "Violation"
            };
            var handler = new SuspendClientCommandHandler(context);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("User not found", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenUserIsNotClient()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldThrowException_WhenUserIsNotClient));

            var user = new USER_DETAIL
            {
                UserId = "U2",
                UserRole = UserRole.Admin, // Not a client
                State = State.Active
            };

            context.USER_DETAIL.Add(user);
            await context.SaveChangesAsync();

            var command = new SuspendClientCommand
            {
                UserId = "U2",
                SuspendedBy = "Admin",
                SuspendedReason = "Violation"
            };

            var handler = new SuspendClientCommandHandler(context);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Only clients can be suspended", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenClientDetailsNotFound()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldThrowException_WhenClientDetailsNotFound));

            var user = new USER_DETAIL
            {
                UserId = "U3",
                UserRole = UserRole.Client,
                State = State.Active
            };

            context.USER_DETAIL.Add(user);
            await context.SaveChangesAsync();

            var command = new SuspendClientCommand
            {
                UserId = "U3",
                SuspendedBy = "Admin",
                SuspendedReason = "Violation"
            };

            var handler = new SuspendClientCommandHandler(context);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Client details not found", ex.Message);
        }
    }
}