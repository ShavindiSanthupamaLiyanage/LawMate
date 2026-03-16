using System;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using LawMate.Application.Common.ResetPassword.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.User;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.Common.ResetPassword.Command
{
    public class RequestPasswordResetCommandHandlerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _dbOptions;
        private readonly ApplicationDbContext _context;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<IEmailTemplateService> _templateServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;

        public RequestPasswordResetCommandHandlerTests()
        {
            _dbOptions = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(_dbOptions);

            _emailServiceMock = new Mock<IEmailService>();
            _templateServiceMock = new Mock<IEmailTemplateService>();
            _configurationMock = new Mock<IConfiguration>();
            _configurationMock.Setup(c => c["App:BaseUrl"]).Returns("http://localhost");
        }

        [Fact]
        public async Task Handle_Should_SendEmail_And_SaveToken_When_NICAndEmailValid()
        {
            // Arrange
            var user = new USER_DETAIL
            {
                NIC = "123456789V",
                Email = "test@example.com",
                RecordStatus = 0
            };
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance |
                                   System.Reflection.BindingFlags.NonPublic |
                                   System.Reflection.BindingFlags.Public)!
                .SetValue(user, "U1");

            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            _templateServiceMock.Setup(t => t.LoadTemplate(It.IsAny<string>()))
                .Returns("<html>OTP: {{OTP}}, Logo: {{LogoUrl}}</html>");

            var handler = new RequestPasswordResetCommandHandler(
                _context,
                _configurationMock.Object,
                _emailServiceMock.Object,
                _templateServiceMock.Object
            );

            var command = new RequestPasswordResetCommand
            {
                NIC = "123456789V",
                Email = "test@example.com"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().Be("Verification email sent.");

            var token = await _context.PASSWORD_RESET_TOKEN.FirstOrDefaultAsync();
            token.Should().NotBeNull();
            token.UserId.Should().Be("U1");
            token.IsUsed.Should().BeFalse();
            token.ExpiryDate.Should().BeAfter(DateTime.UtcNow);

            _emailServiceMock.Verify(e =>
                e.SendAsync(
                    "test@example.com",
                    "LawMate Password Reset Code",
                    It.Is<string>(s => s.Contains(token.Token) && s.Contains("http://localhost/assets/logo.png"))
                ), Times.Once);
        }

        [Fact]
        public async Task Handle_Should_ThrowException_When_UserNotFound()
        {
            // Arrange
            var handler = new RequestPasswordResetCommandHandler(
                _context,
                _configurationMock.Object,
                _emailServiceMock.Object,
                _templateServiceMock.Object
            );

            var command = new RequestPasswordResetCommand
            {
                NIC = "123456789V",
                Email = "wrong@example.com"
            };

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Invalid NIC or Email.");
        }
    }
}