using LawMate.Application.AdminModule.PaymentMaintenance.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LawMate.Tests.Application.AdminModule.PaymentMaintenance.Commands
{
    public class MarkBookingPaymentAsPaidCommandHandlerTests
    {
        private readonly Mock<ICurrentUserService> _currentUserMock;
        private readonly ApplicationDbContext _context;

        public MarkBookingPaymentAsPaidCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString()); // use unique DB name per test
            _currentUserMock = new Mock<ICurrentUserService>();
            _currentUserMock.Setup(x => x.UserId).Returns("test-user");
        }

        [Fact]
        public async Task Handle_ShouldMarkPaymentAsPaid_WhenPaymentIsVerifiedAndNotPaid()
        {
            // Arrange
            var payment = new BOOKING_PAYMENT
            {
                Id = 1,
                VerificationStatus = VerificationStatus.Verified,
                IsPaid = false
            };
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new MarkBookingPaymentAsPaidCommand { PaymentId = 1 };
            var handler = new MarkBookingPaymentAsPaidCommandHandler(_context, _currentUserMock.Object);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert
            var updatedPayment = await _context.BOOKING_PAYMENT.FirstAsync(p => p.Id == 1);
            Assert.True(updatedPayment.IsPaid);
            Assert.Equal("test-user", updatedPayment.ModifiedBy);
            Assert.NotNull(updatedPayment.ModifiedAt);
            Assert.Equal("Booking payment marked as transferred", result);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenPaymentNotFound()
        {
            // Arrange
            var command = new MarkBookingPaymentAsPaidCommand { PaymentId = 999 };
            var handler = new MarkBookingPaymentAsPaidCommandHandler(_context, _currentUserMock.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Booking payment not found", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenPaymentNotVerified()
        {
            // Arrange
            var payment = new BOOKING_PAYMENT
            {
                Id = 2,
                VerificationStatus = VerificationStatus.Pending,
                IsPaid = false
            };
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new MarkBookingPaymentAsPaidCommand { PaymentId = 2 };
            var handler = new MarkBookingPaymentAsPaidCommandHandler(_context, _currentUserMock.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("Only verified payments can be marked as transferred", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenPaymentAlreadyPaid()
        {
            // Arrange
            var payment = new BOOKING_PAYMENT
            {
                Id = 3,
                VerificationStatus = VerificationStatus.Verified,
                IsPaid = true
            };
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new MarkBookingPaymentAsPaidCommand { PaymentId = 3 };
            var handler = new MarkBookingPaymentAsPaidCommandHandler(_context, _currentUserMock.Object);

            // Act & Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => handler.Handle(command, CancellationToken.None));
            Assert.Equal("This payment is already marked as transferred", ex.Message);
        }
    }
}