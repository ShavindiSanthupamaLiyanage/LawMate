using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.ClientModule.ClientRegistration.Commands
{
    public class CreateClientCommandHandlerTests
    {
        private IApplicationDbContext GetContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<Infrastructure.ApplicationDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;

            return new Infrastructure.ApplicationDbContext(options);
        }

        private Mock<ICurrentUserService> GetMockUserService(string? userId = "ADMIN1")
        {
            var mock = new Mock<ICurrentUserService>();
            mock.Setup(s => s.UserId).Returns(userId);
            return mock;
        }

        private Mock<IAppLogger> GetMockLogger()
        {
            var mock = new Mock<IAppLogger>();
            return mock;
        }

        [Fact]
        public async Task Handle_Should_Throw_When_Client_Exists()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_Client_Exists));
            var userService = GetMockUserService();
            var logger = GetMockLogger();

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "C1",
                NIC = "123456789V",
                UserRole = UserRole.Client,
                RecordStatus = 0
            });
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new CreateClientCommandHandler(context, userService.Object, logger.Object);

            var command = new CreateClientCommand
            {
                Data = new CreateClientDto
                {
                    FirstName = "Jane",
                    LastName = "Doe",
                    NIC = "123456789V",
                    Password = "password"
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() =>
                handler.Handle(command, CancellationToken.None));
        }
        
        [Fact]
        public async Task Handle_Should_Throw_When_Email_Already_Registered()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_Email_Already_Registered));
            var userService = GetMockUserService();
            var logger = GetMockLogger();

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "U1",
                Email = "test@example.com",
                RecordStatus = 0
            });
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new CreateClientCommandHandler(context, userService.Object, logger.Object);

            var command = new CreateClientCommand
            {
                Data = new CreateClientDto
                {
                    FirstName = "John",
                    LastName = "Doe",
                    NIC = "987654321V",
                    Password = "password",
                    Email = "test@example.com"
                }
            };

            // Act & Assert
            await Assert.ThrowsAsync<Exception>(() =>
                handler.Handle(command, CancellationToken.None));
        }
    }
}