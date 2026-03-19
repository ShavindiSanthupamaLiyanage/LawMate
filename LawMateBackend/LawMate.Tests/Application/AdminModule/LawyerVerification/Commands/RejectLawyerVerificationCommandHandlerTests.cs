using LawMate.Application.AdminModule.LawyerVerification.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LawMate.Tests.Application.AdminModule.LawyerVerification.Commands
{
    public class RejectLawyerVerificationCommandHandlerTests
    {
        private IApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var context = new ApplicationDbContext(options);

            // Seed a lawyer and user
            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "lawyer1",
                FirstName = "Sunil",
                LastName = "Gamage",
                Email = "sunil@example.com",
                State = State.Inactive,
                UserRole = UserRole.Lawyer
            });

            context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
            {
                UserId = "lawyer1",
                VerificationStatus = VerificationStatus.Pending
            });

            context.SaveChanges();
            return context;
        }

        [Fact]
        public async Task Handle_RejectsLawyerAndSendsEmail_ReturnsSuccessMessage()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var emailServiceMock = new Mock<IEmailService>();
            var templateServiceMock = new Mock<IEmailTemplateService>();

            templateServiceMock.Setup(t => t.LoadTemplate(It.IsAny<string>()))
                .Returns("Hello {{Name}}, your verification is rejected. Reason: {{RejectedReason}} {{LogoUrl}}");

            var handler = new RejectLawyerVerificationCommandHandler(
                dbContext, emailServiceMock.Object, templateServiceMock.Object);

            var command = new RejectLawyerVerificationCommand
            {
                UserId = "lawyer1",
                AdminUserId = "admin123",
                RejectedReason = "Incomplete documents"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert return value
            Assert.Equal("Lawyer rejected successfully", result);

            // Assert database updated
            var lawyer = await dbContext.LAWYER_DETAILS.FirstOrDefaultAsync(x => x.UserId == "lawyer1");
            Assert.NotNull(lawyer);
            Assert.Equal(VerificationStatus.Rejected, lawyer.VerificationStatus);
            Assert.Equal("admin123", lawyer.VerifiedBy);
            Assert.NotNull(lawyer.VerifiedAt);
            Assert.Equal("Incomplete documents", lawyer.RejectedReason);

            // Verify email template loaded
            templateServiceMock.Verify(t => t.LoadTemplate("LawyerRejected.html"), Times.Once);

            // Verify email sent
            var user = await dbContext.USER_DETAIL.FirstOrDefaultAsync(x => x.UserId == "lawyer1");
            emailServiceMock.Verify(e => e.SendAsync(
                user.Email,
                "LawMate Lawyer Verification Rejected",
                It.Is<string>(s => s.Contains("Sunil") && s.Contains("Incomplete documents") && s.Contains("https://yourdomain.com/logo.png"))
            ), Times.Once);
        }

        [Fact]
        public async Task Handle_LawyerNotFound_ThrowsException()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var emailServiceMock = new Mock<IEmailService>();
            var templateServiceMock = new Mock<IEmailTemplateService>();

            var handler = new RejectLawyerVerificationCommandHandler(
                dbContext, emailServiceMock.Object, templateServiceMock.Object);

            var command = new RejectLawyerVerificationCommand
            {
                UserId = "nonexistent",
                AdminUserId = "admin123",
                RejectedReason = "Invalid documents"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Lawyer not found", ex.Message);
        }
    }
}