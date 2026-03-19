using LawMate.Application.AdminModule.PaymentMaintenance.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LawMate.Tests.Application.AdminModule.PaymentMaintenance.Commands
{
    public class UpdateMembershipPaymentStatusCommandHandlerTests
    {
        private readonly Mock<ICurrentUserService> _currentUserMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<IEmailTemplateService> _templateServiceMock;
        private readonly ApplicationDbContext _context;

        public UpdateMembershipPaymentStatusCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
            _currentUserMock = new Mock<ICurrentUserService>();
            _currentUserMock.Setup(x => x.UserId).Returns("test-user");

            _emailServiceMock = new Mock<IEmailService>();
            _templateServiceMock = new Mock<IEmailTemplateService>();
            _templateServiceMock.Setup(t => t.LoadTemplate(It.IsAny<string>()))
                .Returns("Hello {{Name}}, your membership status: {{Reason}}");
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenPaymentNotFound()
        {
            var command = new UpdateMembershipPaymentStatusCommand
            {
                LawyerId = "lawyer-1",
                Status = VerificationStatus.Verified
            };

            var handler = new UpdateMembershipPaymentStatusCommandHandler(
                _context,
                _currentUserMock.Object,
                _emailServiceMock.Object,
                _templateServiceMock.Object);

            var ex = await Assert.ThrowsAsync<Exception>(() =>
                handler.Handle(command, CancellationToken.None));

            Assert.Equal("Payment not found", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldUpdatePaymentAndUser_WhenVerified()
        {
            // Arrange
            var user = new USER_DETAIL
            {
                UserId = "lawyer-1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                State = State.Pending
            };
            var payment = new MEMBERSHIP_PAYMENT
            {
                Id = 1,
                LawyerId = "lawyer-1",
                PaymentDate = DateTime.UtcNow.AddDays(-1),
                VerificationStatus = VerificationStatus.Pending
            };
            _context.USER_DETAIL.Add(user);
            _context.MEMBERSHIP_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new UpdateMembershipPaymentStatusCommand
            {
                LawyerId = "lawyer-1",
                Status = VerificationStatus.Verified
            };

            var handler = new UpdateMembershipPaymentStatusCommandHandler(
                _context,
                _currentUserMock.Object,
                _emailServiceMock.Object,
                _templateServiceMock.Object);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            var updatedPayment = await _context.MEMBERSHIP_PAYMENT.FirstAsync();
            var updatedUser = await _context.USER_DETAIL.FirstAsync();

            // Assert
            Assert.True(result);
            Assert.Equal(VerificationStatus.Verified, updatedPayment.VerificationStatus);
            Assert.Equal("test-user", updatedPayment.VerifiedBy);
            Assert.NotNull(updatedPayment.VerifiedAt);

            Assert.Equal(State.AllVerified, updatedUser.State);

            _templateServiceMock.Verify(t => t.LoadTemplate("MembershipApproved.html"), Times.Once);
            _emailServiceMock.Verify(e => e.SendAsync(
                updatedUser.Email,
                "Membership Payment Approved",
                It.Is<string>(s => s.Contains("John Doe"))
            ), Times.Once);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenRejectedWithoutReason()
        {
            var user = new USER_DETAIL
            {
                UserId = "lawyer-2",
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane@example.com",
                State = State.Pending
            };
            var payment = new MEMBERSHIP_PAYMENT
            {
                Id = 2,
                LawyerId = "lawyer-2",
                PaymentDate = DateTime.UtcNow.AddDays(-1),
                VerificationStatus = VerificationStatus.Pending
            };
            _context.USER_DETAIL.Add(user);
            _context.MEMBERSHIP_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new UpdateMembershipPaymentStatusCommand
            {
                LawyerId = "lawyer-2",
                Status = VerificationStatus.Rejected,
                RejectionReason = null
            };

            var handler = new UpdateMembershipPaymentStatusCommandHandler(
                _context,
                _currentUserMock.Object,
                _emailServiceMock.Object,
                _templateServiceMock.Object);

            var ex = await Assert.ThrowsAsync<Exception>(() =>
                handler.Handle(command, CancellationToken.None));

            Assert.Equal("Rejection reason is required", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldUpdatePaymentAndUser_WhenRejectedWithReason()
        {
            var user = new USER_DETAIL
            {
                UserId = "lawyer-3",
                FirstName = "Alice",
                LastName = "Brown",
                Email = "alice@example.com",
                State = State.AllVerified
            };
            var payment = new MEMBERSHIP_PAYMENT
            {
                Id = 3,
                LawyerId = "lawyer-3",
                PaymentDate = DateTime.UtcNow.AddDays(-1),
                VerificationStatus = VerificationStatus.Pending
            };
            _context.USER_DETAIL.Add(user);
            _context.MEMBERSHIP_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new UpdateMembershipPaymentStatusCommand
            {
                LawyerId = "lawyer-3",
                Status = VerificationStatus.Rejected,
                RejectionReason = "Payment invalid"
            };

            var handler = new UpdateMembershipPaymentStatusCommandHandler(
                _context,
                _currentUserMock.Object,
                _emailServiceMock.Object,
                _templateServiceMock.Object);

            var result = await handler.Handle(command, CancellationToken.None);

            var updatedPayment = await _context.MEMBERSHIP_PAYMENT.FirstAsync();
            var updatedUser = await _context.USER_DETAIL.FirstAsync();

            Assert.True(result);
            Assert.Equal(VerificationStatus.Rejected, updatedPayment.VerificationStatus);
            Assert.Equal("Payment invalid", updatedPayment.RejectionReason);
            Assert.Equal("test-user", updatedPayment.VerifiedBy);
            Assert.NotNull(updatedPayment.VerifiedAt);

            Assert.Equal(State.Pending, updatedUser.State);

            _templateServiceMock.Verify(t => t.LoadTemplate("MembershipRejected.html"), Times.Once);
            _emailServiceMock.Verify(e => e.SendAsync(
                updatedUser.Email,
                "Membership Payment Rejected",
                It.Is<string>(s => s.Contains("Alice Brown") && s.Contains("Payment invalid"))
            ), Times.Once);
        }
    }
}