using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.ClientModule.ClientRegistration.Commands
{
    public class DeleteClientCommandHandlerTests
    {
        private IApplicationDbContext GetContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<Infrastructure.ApplicationDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            return new Infrastructure.ApplicationDbContext(options);
        }
        
        [Fact]
        public async Task Handle_Should_Throw_When_Client_NotFound()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_Client_NotFound));
            var handler = new DeleteClientCommandHandler(context);
            var command = new DeleteClientCommand("C2"); // doesn't exist

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(command, CancellationToken.None));
        }
    }
}