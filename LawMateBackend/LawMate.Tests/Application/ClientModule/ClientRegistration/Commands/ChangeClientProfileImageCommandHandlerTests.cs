using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.ClientModule.ClientRegistration.Commands
{
    public class ChangeClientProfileImageCommandHandlerTests
    {
        private IApplicationDbContext GetContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<Infrastructure.ApplicationDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            return new Infrastructure.ApplicationDbContext(options);
        }

        [Fact]
        public async Task Handle_Should_Update_ProfileImage_When_File_Provided()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Update_ProfileImage_When_File_Provided));

            var user = new USER_DETAIL
            {
                UserId = "U1",
                FirstName = "John",
                RecordStatus = 0
            };
            context.USER_DETAIL.Add(user);
            await context.SaveChangesAsync(CancellationToken.None);

            // Mock IFormFile
            var fileMock = new Mock<IFormFile>();
            var content = "Test Image";
            var ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));
            fileMock.Setup(f => f.Length).Returns(ms.Length);
            fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                    .Returns((Stream s, CancellationToken ct) => ms.CopyToAsync(s, ct));

            var handler = new ChangeClientProfileImageCommandHandler(context);
            var command = new ChangeClientProfileImageCommand
            {
                UserId = "U1",
                ProfileImage = fileMock.Object
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.NotNull(result.ProfileImage);
            Assert.Equal(System.Text.Encoding.UTF8.GetBytes(content), result.ProfileImage);
        }

        [Fact]
        public async Task Handle_Should_Not_Update_ProfileImage_When_File_Null()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Not_Update_ProfileImage_When_File_Null));

            var user = new USER_DETAIL
            {
                UserId = "U1",
                FirstName = "John",
                RecordStatus = 0
            };
            context.USER_DETAIL.Add(user);
            await context.SaveChangesAsync(CancellationToken.None);

            var handler = new ChangeClientProfileImageCommandHandler(context);
            var command = new ChangeClientProfileImageCommand
            {
                UserId = "U1",
                ProfileImage = null
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.Null(result.ProfileImage);
        }

        [Fact]
        public async Task Handle_Should_Throw_When_User_Not_Found()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Throw_When_User_Not_Found));
            var handler = new ChangeClientProfileImageCommandHandler(context);

            var command = new ChangeClientProfileImageCommand
            {
                UserId = "NonExistent",
                ProfileImage = null
            };

            // Act & Assert
            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(command, CancellationToken.None));
        }
    }
}