using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using LawMate.Application.Common.ResetPassword.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.User;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.Common.ResetPassword.Command
{
    public class ResetPasswordWithTokenCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public ResetPasswordWithTokenCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_Should_ResetPassword_And_MarkTokenUsed_When_TokenValid()
        {
            // Arrange
            var user = new USER_DETAIL
            {
                RecordStatus = 0,
                Email = "test@example.com"
            };
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance |
                                   System.Reflection.BindingFlags.NonPublic |
                                   System.Reflection.BindingFlags.Public)!
                .SetValue(user, "U1");

            _context.USER_DETAIL.Add(user);

            var token = new PASSWORD_RESET_TOKEN
            {
                UserId = "U1",
                Token = "VALIDTOKEN",
                ExpiryDate = DateTime.UtcNow.AddMinutes(10),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "U1"
            };

            _context.PASSWORD_RESET_TOKEN.Add(token);
            await _context.SaveChangesAsync();

            var handler = new ResetPasswordWithTokenCommandHandler(_context);

            var command = new ResetPasswordWithTokenCommand
            {
                Token = "VALIDTOKEN",
                NewPassword = "NewPassword123!"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be("Password reset successful.");

            var updatedUser = await _context.USER_DETAIL.FirstAsync(x => x.UserId == "U1");
            updatedUser.Password.Should().Be(CryptoUtil.Encrypt("NewPassword123!", "U1"));
            updatedUser.ModifiedBy.Should().Be("U1");
            updatedUser.ModifiedAt.Should().BeAfter(DateTime.UtcNow.AddMinutes(-1));

            var updatedToken = await _context.PASSWORD_RESET_TOKEN.FirstAsync(x => x.Token == "VALIDTOKEN");
            updatedToken.IsUsed.Should().BeTrue();
            updatedToken.ModifiedBy.Should().Be("U1");
            updatedToken.ModifiedAt.Should().BeAfter(DateTime.UtcNow.AddMinutes(-1));
        }

        [Fact]
        public async Task Handle_Should_ThrowException_When_TokenInvalidOrExpired()
        {
            // Arrange
            var handler = new ResetPasswordWithTokenCommandHandler(_context);

            var command = new ResetPasswordWithTokenCommand
            {
                Token = "INVALIDTOKEN",
                NewPassword = "NewPassword123!"
            };

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Invalid or expired token.");
        }

        [Fact]
        public async Task Handle_Should_ThrowException_When_TokenAlreadyUsed()
        {
            // Arrange
            var user = new USER_DETAIL();
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance |
                                   System.Reflection.BindingFlags.NonPublic |
                                   System.Reflection.BindingFlags.Public)!
                .SetValue(user, "U1");

            _context.USER_DETAIL.Add(user);

            var token = new PASSWORD_RESET_TOKEN
            {
                UserId = "U1",
                Token = "USEDTOKEN",
                ExpiryDate = DateTime.UtcNow.AddMinutes(10),
                IsUsed = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "U1"
            };

            _context.PASSWORD_RESET_TOKEN.Add(token);
            await _context.SaveChangesAsync();

            var handler = new ResetPasswordWithTokenCommandHandler(_context);

            var command = new ResetPasswordWithTokenCommand
            {
                Token = "USEDTOKEN",
                NewPassword = "NewPassword123!"
            };

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Invalid or expired token.");
        }

        [Fact]
        public async Task Handle_Should_ThrowException_When_TokenExpired()
        {
            // Arrange
            var user = new USER_DETAIL();
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance |
                                   System.Reflection.BindingFlags.NonPublic |
                                   System.Reflection.BindingFlags.Public)!
                .SetValue(user, "U1");

            _context.USER_DETAIL.Add(user);

            var token = new PASSWORD_RESET_TOKEN
            {
                UserId = "U1",
                Token = "EXPIREDTOKEN",
                ExpiryDate = DateTime.UtcNow.AddMinutes(-1),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "U1"
            };

            _context.PASSWORD_RESET_TOKEN.Add(token);
            await _context.SaveChangesAsync();

            var handler = new ResetPasswordWithTokenCommandHandler(_context);

            var command = new ResetPasswordWithTokenCommand
            {
                Token = "EXPIREDTOKEN",
                NewPassword = "NewPassword123!"
            };

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Invalid or expired token.");
        }
    }
}