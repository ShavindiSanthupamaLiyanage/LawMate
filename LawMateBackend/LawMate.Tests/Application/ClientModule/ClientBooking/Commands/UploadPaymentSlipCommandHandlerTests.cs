using LawMate.Application.ClientModule.ClientBookings.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Booking;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LawMate.Tests.Application.ClientModule.ClientBooking.Commands
{
    public class UploadPaymentSlipCommandHandlerTests
    {
        private IApplicationDbContext GetContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(dbName)
                .Options;
            return new ApplicationDbContext(options);
        }

        private Mock<ICurrentUserService> _userMock = new();
        private Mock<IAppLogger> _loggerMock = new();

        [Fact]
        public async Task Handle_Should_Save_PaymentSlip_Successfully()
        {
            // Arrange
            var context = GetContext(nameof(Handle_Should_Save_PaymentSlip_Successfully));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1",
                BookingStatus = BookingStatus.Accepted
            };
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync(CancellationToken.None);

            _userMock.Setup(u => u.UserId).Returns("C1");

            var handler = new UploadPaymentSlipCommandHandler(context, _userMock.Object, _loggerMock.Object);

            var base64Image = Convert.ToBase64String(new byte[] { 1, 2, 3 });

            var command = new UploadPaymentSlipCommand
            {
                BookingId = 1,
                SlipImageBase64 = base64Image
            };

            // Act
            var paymentId = await handler.Handle(command, CancellationToken.None);

            // Assert
            var payment = await context.BOOKING_PAYMENT.FirstOrDefaultAsync(p => p.Id == paymentId);
            Assert.NotNull(payment);
            Assert.Equal(booking.BookingId, payment.BookingId);
            Assert.Equal(booking.LawyerId, payment.LawyerId);
            Assert.Equal("C1", payment.CreatedBy);
            Assert.Equal(new byte[] { 1, 2, 3 }, payment.ReceiptDocument);
        }

        [Fact]
        public async Task Handle_Should_Throw_Unauthorized_When_UserId_Null()
        {
            var context = GetContext(nameof(Handle_Should_Throw_Unauthorized_When_UserId_Null));
            _userMock.Setup(u => u.UserId).Returns((string?)null);

            var handler = new UploadPaymentSlipCommandHandler(context, _userMock.Object, _loggerMock.Object);
            var command = new UploadPaymentSlipCommand { BookingId = 1, SlipImageBase64 = "dGVzdA==" };

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_KeyNotFound_When_Booking_NotFound()
        {
            var context = GetContext(nameof(Handle_Should_Throw_KeyNotFound_When_Booking_NotFound));
            _userMock.Setup(u => u.UserId).Returns("C1");

            var handler = new UploadPaymentSlipCommandHandler(context, _userMock.Object, _loggerMock.Object);
            var command = new UploadPaymentSlipCommand { BookingId = 999, SlipImageBase64 = "dGVzdA==" };

            await Assert.ThrowsAsync<KeyNotFoundException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_InvalidOperation_When_Duplicate_Slip()
        {
            var context = GetContext(nameof(Handle_Should_Throw_InvalidOperation_When_Duplicate_Slip));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1",
                BookingStatus = BookingStatus.Accepted
            };
            context.BOOKING.Add(booking);
            context.BOOKING_PAYMENT.Add(new BOOKING_PAYMENT
            {
                BookingId = 1,
                VerificationStatus = VerificationStatus.Pending
            });
            await context.SaveChangesAsync(CancellationToken.None);

            _userMock.Setup(u => u.UserId).Returns("C1");

            var handler = new UploadPaymentSlipCommandHandler(context, _userMock.Object, _loggerMock.Object);
            var command = new UploadPaymentSlipCommand { BookingId = 1, SlipImageBase64 = "dGVzdA==" };

            await Assert.ThrowsAsync<InvalidOperationException>(() =>
                handler.Handle(command, CancellationToken.None));
        }

        [Fact]
        public async Task Handle_Should_Throw_ArgumentException_For_Invalid_Base64()
        {
            var context = GetContext(nameof(Handle_Should_Throw_ArgumentException_For_Invalid_Base64));

            var booking = new BOOKING
            {
                BookingId = 1,
                ClientId = "C1",
                LawyerId = "L1",
                BookingStatus = BookingStatus.Accepted
            };
            context.BOOKING.Add(booking);
            await context.SaveChangesAsync(CancellationToken.None);

            _userMock.Setup(u => u.UserId).Returns("C1");

            var handler = new UploadPaymentSlipCommandHandler(context, _userMock.Object, _loggerMock.Object);
            var command = new UploadPaymentSlipCommand { BookingId = 1, SlipImageBase64 = "invalid_base64" };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                handler.Handle(command, CancellationToken.None));
        }
    }
}