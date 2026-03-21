using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using LawMate.Application.AdminModule.AdminRegistration.Commands;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.AspNetCore.Http;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.AdminRegistration.Commands
{
    public class ChangeAdminProfileImageCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public ChangeAdminProfileImageCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_Should_Update_ProfileImage_When_Image_Provided()
        {
            // Arrange
            var user = new USER_DETAIL
            {
                ProfileImage = null
            };

            typeof(USER_DETAIL)
                .GetProperty("UserId",
                    System.Reflection.BindingFlags.Instance |
                    System.Reflection.BindingFlags.NonPublic |
                    System.Reflection.BindingFlags.Public)!
                .SetValue(user, "A1");

            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            // Mock IFormFile
            var content = new byte[] { 1, 2, 3 };
            var ms = new MemoryStream(content);

            var fileMock = new Mock<IFormFile>();
            fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns<Stream, CancellationToken>((stream, token) =>
                {
                    ms.Position = 0;
                    return ms.CopyToAsync(stream, token);
                });

            var command = new ChangeAdminProfileImageCommand
            {
                UserId = "A1",
                ProfileImage = fileMock.Object
            };

            var handler = new ChangeAdminProfileImageCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();

            var updatedUser = await _context.USER_DETAIL
                .FirstAsync(x => x.UserId == "A1");

            updatedUser.ProfileImage.Should().BeEquivalentTo(content);
        }

        [Fact]
        public async Task Handle_Should_Not_Change_Image_When_ProfileImage_Is_Null()
        {
            // Arrange
            var existingImage = new byte[] { 9, 9, 9 };

            var user = new USER_DETAIL
            {
                ProfileImage = existingImage
            };

            typeof(USER_DETAIL)
                .GetProperty("UserId",
                    System.Reflection.BindingFlags.Instance |
                    System.Reflection.BindingFlags.NonPublic |
                    System.Reflection.BindingFlags.Public)!
                .SetValue(user, "A2");

            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            var command = new ChangeAdminProfileImageCommand
            {
                UserId = "A2",
                ProfileImage = null
            };

            var handler = new ChangeAdminProfileImageCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().BeTrue();

            var updatedUser = await _context.USER_DETAIL
                .FirstAsync(x => x.UserId == "A2");

            updatedUser.ProfileImage.Should().BeEquivalentTo(existingImage);
        }

        [Fact]
        public async Task Handle_Should_Throw_Exception_When_Admin_Not_Found()
        {
            // Arrange
            var command = new ChangeAdminProfileImageCommand
            {
                UserId = "NOT_FOUND",
                ProfileImage = null
            };

            var handler = new ChangeAdminProfileImageCommandHandler(_context);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Admin not found");
        }
    }
}