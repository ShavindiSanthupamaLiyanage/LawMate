using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Tests.Common;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.ClientModule.ClientRegistration.Commands
{
    public class UpdateClientCommandHandlerTests
    {
        [Fact]
        public async Task Handle_ShouldUpdateClient_WhenClientExists()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldUpdateClient_WhenClientExists));

            var user = new USER_DETAIL
            {
                UserId = "U1",
                Prefix = Prefix.Mr,
                FirstName = "Old",
                LastName = "Name",
                Email = "old@test.com",
                ContactNumber = "123",
                RecordStatus = 0
            };

            var client = new CLIENT_DETAILS
            {
                UserId = "U1",
                Address = "Old Address",
                District = "Old District",
                PrefferedLanguage = Language.English
            };

            context.USER_DETAIL.Add(user);
            context.CLIENT_DETAILS.Add(client);
            await context.SaveChangesAsync();

            var command = new UpdateClientCommand
            {
                UserId = "U1",
                Prefix = Prefix.Dr,
                FirstName = "New",
                LastName = "Client",
                Email = "new@test.com",
                ContactNumber = "456",
                Address = "New Address",
                District = "New District",
                PrefferedLanguage = Language.Sinhala
            };

            var handler = new UpdateClientCommandHandler(context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            var updatedUser = await context.USER_DETAIL.FirstOrDefaultAsync(u => u.UserId == "U1");
            var updatedClient = await context.CLIENT_DETAILS.FirstOrDefaultAsync(c => c.UserId == "U1");

            Assert.NotNull(updatedUser);
            Assert.NotNull(updatedClient);
            Assert.Equal(Prefix.Dr, updatedUser.Prefix);
            Assert.Equal("New", updatedUser.FirstName);
            Assert.Equal("Client", updatedUser.LastName);
            Assert.Equal("New Client", updatedUser.UserName);
            Assert.Equal("new@test.com", updatedUser.Email);
            Assert.Equal("456", updatedUser.ContactNumber);

            Assert.Equal("New Address", updatedClient.Address);
            Assert.Equal("New District", updatedClient.District);
            Assert.Equal(Language.Sinhala, updatedClient.PrefferedLanguage);

            Assert.Equal("Client updated successfully", result);
        }

        [Fact]
        public async Task Handle_ShouldCreateClientDetails_WhenMissing()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldCreateClientDetails_WhenMissing));

            var user = new USER_DETAIL
            {
                UserId = "U2",
                Prefix = Prefix.Ms,
                FirstName = "First",
                LastName = "Last",
                RecordStatus = 0
            };

            context.USER_DETAIL.Add(user);
            await context.SaveChangesAsync();

            var command = new UpdateClientCommand
            {
                UserId = "U2",
                Prefix = Prefix.Ms,
                FirstName = "Updated",
                LastName = "Name",
                Address = "Address",
                District = "District",
                PrefferedLanguage = Language.Tamil
            };

            var handler = new UpdateClientCommandHandler(context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            var updatedClient = await context.CLIENT_DETAILS.FirstOrDefaultAsync(c => c.UserId == "U2");
            Assert.NotNull(updatedClient);
            Assert.Equal("Address", updatedClient.Address);
            Assert.Equal("District", updatedClient.District);
            Assert.Equal(Language.Tamil, updatedClient.PrefferedLanguage);

            Assert.Equal("Client updated successfully", result);
        }

        [Fact]
        public async Task Handle_ShouldThrow_WhenEmailAlreadyExists()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldThrow_WhenEmailAlreadyExists));

            context.USER_DETAIL.AddRange(
                new USER_DETAIL { UserId = "U3", Email = "exists@test.com", RecordStatus = 0 },
                new USER_DETAIL { UserId = "U4", Email = "old@test.com", RecordStatus = 0 }
            );
            await context.SaveChangesAsync();

            var command = new UpdateClientCommand
            {
                UserId = "U4",
                Email = "exists@test.com" 
            };

            var handler = new UpdateClientCommandHandler(context);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Email already registered.", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldThrow_WhenUserNotFound()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldThrow_WhenUserNotFound));

            var command = new UpdateClientCommand
            {
                UserId = "NonExistent"
            };

            var handler = new UpdateClientCommandHandler(context);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Client not found", ex.Message);
        }
    }
}