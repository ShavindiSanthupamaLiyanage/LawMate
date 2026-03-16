using FluentAssertions;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Commands
{
    public class UploadMembershipPaymentCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<IAppLogger> _loggerMock;

        public UploadMembershipPaymentCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _loggerMock = new Mock<IAppLogger>();

            _currentUserServiceMock.Setup(x => x.UserId).Returns("SYSTEM");
        }

        private IFormFile CreateMockFile(byte[] content)
        {
            var ms = new MemoryStream(content);

            var mock = new Mock<IFormFile>();
            mock.Setup(x => x.Length).Returns(ms.Length);

            mock.Setup(x => x.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns<Stream, CancellationToken>((stream, token) =>
                {
                    ms.Position = 0;
                    return ms.CopyToAsync(stream, token);
                });

            return mock.Object;
        }

        [Fact]
        public async Task Handle_Should_Create_MembershipPayment_When_LawyerExists()
        {
            // Arrange
            var lawyerId = "L100";

            var lawyer = new LAWYER_DETAILS { UserId = lawyerId };
            var user = new USER_DETAIL { UserId = lawyerId, State = State.Pending };

            _context.LAWYER_DETAILS.Add(lawyer);
            _context.USER_DETAIL.Add(user);
            await _context.SaveChangesAsync();

            var receiptFile = CreateMockFile(new byte[] { 1, 2, 3 });

            var command = new UploadMembershipPaymentCommand
            {
                LawyerId = lawyerId,
                MembershipType = MembershipType.Monthly,
                Amount = 5000,
                ReceiptDocument = receiptFile
            };

            var handler = new UploadMembershipPaymentCommandHandler(
                _context,
                _currentUserServiceMock.Object,
                _loggerMock.Object);

            // Act
            var transactionId = await handler.Handle(command, CancellationToken.None);

            // Assert
            transactionId.Should().NotBeNullOrEmpty();

            var payment = await _context.MEMBERSHIP_PAYMENT
                .FirstOrDefaultAsync(x => x.LawyerId == lawyerId);

            payment.Should().NotBeNull();
            payment!.Amount.Should().Be(5000);
            payment.PaymentStatus.Should().Be(PaymentStatus.Paid);
            payment.VerificationStatus.Should().Be(VerificationStatus.Pending);
            payment.ReceiptDocument.Should().BeEquivalentTo(new byte[] { 1, 2, 3 });

            var updatedUser = await _context.USER_DETAIL.FirstAsync(x => x.UserId == lawyerId);
            updatedUser.State.Should().Be(State.Active);
        }

        [Fact]
        public async Task Handle_Should_Create_Payment_When_Receipt_Is_Null()
        {
            // Arrange
            var lawyerId = "L200";

            _context.LAWYER_DETAILS.Add(new LAWYER_DETAILS { UserId = lawyerId });
            _context.USER_DETAIL.Add(new USER_DETAIL { UserId = lawyerId });

            await _context.SaveChangesAsync();

            var command = new UploadMembershipPaymentCommand
            {
                LawyerId = lawyerId,
                MembershipType = MembershipType.BiAnnual,
                Amount = 10000,
                ReceiptDocument = null
            };

            var handler = new UploadMembershipPaymentCommandHandler(
                _context,
                _currentUserServiceMock.Object,
                _loggerMock.Object);

            // Act
            var transactionId = await handler.Handle(command, CancellationToken.None);

            // Assert
            transactionId.Should().NotBeNullOrEmpty();

            var payment = await _context.MEMBERSHIP_PAYMENT
                .FirstOrDefaultAsync(x => x.LawyerId == lawyerId);

            payment.Should().NotBeNull();
            payment!.ReceiptDocument.Should().BeNull();
        }

        [Fact]
        public async Task Handle_Should_Throw_Exception_When_Lawyer_Not_Found()
        {
            // Arrange
            var command = new UploadMembershipPaymentCommand
            {
                LawyerId = "UNKNOWN",
                MembershipType = MembershipType.Monthly,
                Amount = 5000
            };

            var handler = new UploadMembershipPaymentCommandHandler(
                _context,
                _currentUserServiceMock.Object,
                _loggerMock.Object);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("Lawyer not found.");
        }
    }
}