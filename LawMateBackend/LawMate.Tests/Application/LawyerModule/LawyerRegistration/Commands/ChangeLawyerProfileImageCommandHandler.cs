using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Commands;

    public class ChangeLawyerProfileImageCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public ChangeLawyerProfileImageCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_Should_UpdateProfileImage_When_ImageProvided()
        {
            // Arrange
            var user = new USER_DETAIL();
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance |
                                   System.Reflection.BindingFlags.NonPublic |
                                   System.Reflection.BindingFlags.Public)!
                .SetValue(user, "U1");

            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            // Mock IFormFile
            var fileMock = new Mock<IFormFile>();
            var content = new byte[] { 1, 2, 3, 4 };
            var ms = new MemoryStream(content);
            fileMock.Setup(f => f.OpenReadStream()).Returns(ms);
            fileMock.Setup(f => f.Length).Returns(ms.Length);
            fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns<Stream, CancellationToken>((stream, token) =>
                {
                    ms.Position = 0;
                    return ms.CopyToAsync(stream, token);
                });

            var command = new ChangeLawyerProfileImageCommand
            {
                UserId = "U1",
                ProfileImage = fileMock.Object
            };

            var handler = new ChangeLawyerProfileImageCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be("U1");
            result.ProfileImage.Should().BeEquivalentTo(content);

            var userFromDb = await _context.USER_DETAIL.FirstAsync(x => x.UserId == "U1");
            userFromDb.ProfileImage.Should().BeEquivalentTo(content);
        }

        [Fact]
        public async Task Handle_Should_NotChangeProfileImage_When_NoImageProvided()
        {
            // Arrange
            var user = new USER_DETAIL
            {
                ProfileImage = new byte[] { 10, 20, 30 }
            };
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance |
                                   System.Reflection.BindingFlags.NonPublic |
                                   System.Reflection.BindingFlags.Public)!
                .SetValue(user, "U2");

            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            var command = new ChangeLawyerProfileImageCommand
            {
                UserId = "U2",
                ProfileImage = null
            };

            var handler = new ChangeLawyerProfileImageCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.UserId.Should().Be("U2");
            result.ProfileImage.Should().BeEquivalentTo(new byte[] { 10, 20, 30 });
        }

        [Fact]
        public async Task Handle_Should_ThrowKeyNotFoundException_When_UserNotFound()
        {
            // Arrange
            var command = new ChangeLawyerProfileImageCommand
            {
                UserId = "NONEXISTENT",
                ProfileImage = null
            };

            var handler = new ChangeLawyerProfileImageCommandHandler(_context);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("User not found");
        }
    }