using LawMate.Application.AdminModule.LawyerVerification.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LawMate.Tests.Application.AdminModule.LawyerVerification.Commands
{
    public class AcceptLawyerVerificationCommandHandlerTests
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
        public async Task Handle_VerifiesLawyerAndSendsEmail_ReturnsSuccessMessage()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var emailServiceMock = new Mock<IEmailService>();
            var templateServiceMock = new Mock<IEmailTemplateService>();

            templateServiceMock.Setup(t => t.LoadTemplate(It.IsAny<string>()))
                .Returns("Hello {{Name}}, your verification is complete. {{LogoUrl}}");

            var handler = new AcceptLawyerVerificationCommandHandler(
                dbContext, emailServiceMock.Object, templateServiceMock.Object);

            var command = new AcceptLawyerVerificationCommand
            {
                UserId = "lawyer1",
                AdminUserId = "admin123"
            };

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert result string
            Assert.Equal("Lawyer verified successfully", result);

            // Assert database updated
            var lawyer = await dbContext.LAWYER_DETAILS.FirstOrDefaultAsync(x => x.UserId == "lawyer1");
            var user = await dbContext.USER_DETAIL.FirstOrDefaultAsync(x => x.UserId == "lawyer1");

            Assert.NotNull(lawyer);
            Assert.Equal(VerificationStatus.Verified, lawyer.VerificationStatus);
            Assert.Equal("admin123", lawyer.VerifiedBy);
            Assert.NotNull(lawyer.VerifiedAt);
            Assert.Null(lawyer.RejectedReason);

            Assert.NotNull(user);
            Assert.Equal(State.Pending, user.State);

            // Verify email template loaded
            templateServiceMock.Verify(t => t.LoadTemplate("LawyerVerified.html"), Times.Once);

            // Verify email sent
            emailServiceMock.Verify(e => e.SendAsync(
                user.Email,
                "LawMate Lawyer Verification Approved",
                It.Is<string>(s => s.Contains("Sunil") && s.Contains("https://yourdomain.com/logo.png"))
            ), Times.Once);
        }

        [Fact]
        public async Task Handle_LawyerNotFound_ThrowsException()
        {
            // Arrange
            var dbContext = CreateDbContext();
            var emailServiceMock = new Mock<IEmailService>();
            var templateServiceMock = new Mock<IEmailTemplateService>();

            var handler = new AcceptLawyerVerificationCommandHandler(
                dbContext, emailServiceMock.Object, templateServiceMock.Object);

            var command = new AcceptLawyerVerificationCommand
            {
                UserId = "nonexistent", // not in DB
                AdminUserId = "admin123"
            };

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Lawyer not found", ex.Message);
        }
    }
}