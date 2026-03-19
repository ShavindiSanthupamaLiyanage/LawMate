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
    public class UpdateBookingPaymentStatusCommandHandlerTests
    {
        private readonly Mock<ICurrentUserService> _currentUserMock;
        private readonly ApplicationDbContext _context;

        public UpdateBookingPaymentStatusCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
            _currentUserMock = new Mock<ICurrentUserService>();
            _currentUserMock.Setup(x => x.UserId).Returns("test-user");
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenPaymentNotFound()
        {
            var command = new UpdateBookingPaymentStatusCommand
            {
                BookingId = 999,
                Status = VerificationStatus.Verified
            };

            var handler = new UpdateBookingPaymentStatusCommandHandler(_context, _currentUserMock.Object);

            var ex = await Assert.ThrowsAsync<Exception>(() =>
                handler.Handle(command, CancellationToken.None));

            Assert.Equal("Payment not found", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldThrowException_WhenRejectedWithoutReason()
        {
            var payment = new BOOKING_PAYMENT { Id = 1, BookingId = 1, VerificationStatus = VerificationStatus.Pending };
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new UpdateBookingPaymentStatusCommand
            {
                BookingId = 1,
                Status = VerificationStatus.Rejected,
                RejectionReason = null
            };

            var handler = new UpdateBookingPaymentStatusCommandHandler(_context, _currentUserMock.Object);

            var ex = await Assert.ThrowsAsync<Exception>(() =>
                handler.Handle(command, CancellationToken.None));

            Assert.Equal("Rejection reason is required", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldUpdatePaymentAndBooking_WhenRejectedWithReason()
        {
            var booking = new BOOKING
            {
                BookingId = 1,
                BookingStatus = BookingStatus.Pending,
                ClientId = "client-1",
                LawyerId = "lawyer-1"
            };

            var payment = new BOOKING_PAYMENT
            {
                Id = 1,
                BookingId = 1,
                VerificationStatus = VerificationStatus.Pending,
                LawyerId = "lawyer-1"
            };

            _context.BOOKING.Add(booking);
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new UpdateBookingPaymentStatusCommand
            {
                BookingId = 1,
                Status = VerificationStatus.Rejected,
                RejectionReason = "Invalid documents"
            };

            var handler = new UpdateBookingPaymentStatusCommandHandler(_context, _currentUserMock.Object);

            var result = await handler.Handle(command, CancellationToken.None);

            var updatedPayment = await _context.BOOKING_PAYMENT.FirstAsync(p => p.BookingId == 1);
            var updatedBooking = await _context.BOOKING.FirstAsync(b => b.BookingId == 1);

            Assert.Equal(VerificationStatus.Rejected, updatedPayment.VerificationStatus);
            Assert.Equal("Invalid documents", updatedPayment.RejectionReason);
            Assert.Equal("test-user", updatedPayment.VerifiedBy);
            Assert.NotNull(updatedPayment.VerifiedAt);

            Assert.Equal(BookingStatus.Rejected, updatedBooking.BookingStatus);
            Assert.Equal("Booking payment updated", result);
        }
        
        [Fact]
        public async Task Handle_ShouldUpdatePaymentAndBooking_WhenVerified()
        {
            var booking = new BOOKING
            {
                BookingId = 2,
                BookingStatus = BookingStatus.Pending,
                ClientId = "client-2",    // required
                LawyerId = "lawyer-2"     // required
            };

            var payment = new BOOKING_PAYMENT
            {
                Id = 2,
                BookingId = 2,
                VerificationStatus = VerificationStatus.Pending,
                LawyerId = "lawyer-2"   
            };
            _context.BOOKING.Add(booking);
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var command = new UpdateBookingPaymentStatusCommand
            {
                BookingId = 2,
                Status = VerificationStatus.Verified
            };

            var handler = new UpdateBookingPaymentStatusCommandHandler(_context, _currentUserMock.Object);

            var result = await handler.Handle(command, CancellationToken.None);

            var updatedPayment = await _context.BOOKING_PAYMENT.FirstAsync(p => p.BookingId == 2);
            var updatedBooking = await _context.BOOKING.FirstAsync(b => b.BookingId == 2);

            Assert.Equal(VerificationStatus.Verified, updatedPayment.VerificationStatus);
            Assert.Equal("test-user", updatedPayment.VerifiedBy);
            Assert.NotNull(updatedPayment.VerifiedAt);

            Assert.Equal(BookingStatus.Verified, updatedBooking.BookingStatus);
            Assert.Equal("Booking payment updated", result);
        }
    }
}