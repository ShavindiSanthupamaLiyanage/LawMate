using LawMate.Application.AdminModule.PaymentMaintenance.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using Xunit;

namespace LawMate.Tests.Application.AdminModule.PaymentMaintenance.Queries
{
    public class GetPaymentByIdQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetPaymentByIdQueryHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_ShouldReturnBookingPayment_WhenExists()
        {
            // Arrange
            var lawyer = new USER_DETAIL { UserId = "lawyer-1", FirstName = "John", LastName = "Doe", Email = "lawyer@example.com" };
            var client = new USER_DETAIL { UserId = "client-1", FirstName = "Jane", LastName = "Smith", Email = "client@example.com" };
            var booking = new BOOKING { BookingId = 1, LawyerId = "lawyer-1", ClientId = "client-1", BookingStatus = BookingStatus.Pending };
            var payment = new BOOKING_PAYMENT { Id = 1, BookingId = 1, TransactionId = "TX123", Amount = 100, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Pending };

            _context.USER_DETAIL.AddRange(lawyer, client);
            _context.BOOKING.Add(booking);
            _context.BOOKING_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var query = new GetPaymentByIdQuery
            {
                PaymentType = "booking",
                LawyerId = "lawyer-1",
                ClientId = "client-1"
            };
            var handler = new GetPaymentByIdQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Booking", result.PaymentType);
            Assert.Equal("lawyer-1", result.LawyerId);
            Assert.Equal("client-1", result.ClientId);
            Assert.Equal("TX123", result.TransactionId);
            Assert.Equal(100, result.Amount);
        }

        [Fact]
        public async Task Handle_ShouldReturnMembershipPayment_WhenExists()
        {
            // Arrange
            var lawyer = new USER_DETAIL { UserId = "lawyer-2", FirstName = "Alice", LastName = "Brown", Email = "alice@example.com" };
            var payment = new MEMBERSHIP_PAYMENT { Id = 1, LawyerId = "lawyer-2", TransactionId = "M123", Amount = 200, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Pending };

            _context.USER_DETAIL.Add(lawyer);
            _context.MEMBERSHIP_PAYMENT.Add(payment);
            await _context.SaveChangesAsync();

            var query = new GetPaymentByIdQuery
            {
                PaymentType = "membership",
                LawyerId = "lawyer-2"
            };
            var handler = new GetPaymentByIdQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Membership", result.PaymentType);
            Assert.Equal("lawyer-2", result.LawyerId);
            Assert.Equal("M123", result.TransactionId);
            Assert.Equal(200, result.Amount);
        }

        [Fact]
        public async Task Handle_ShouldReturnNull_WhenBookingPaymentNotFound()
        {
            var query = new GetPaymentByIdQuery
            {
                PaymentType = "booking",
                LawyerId = "nonexistent",
                ClientId = "nonexistent"
            };
            var handler = new GetPaymentByIdQueryHandler(_context);

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_ShouldReturnNull_WhenMembershipPaymentNotFound()
        {
            var query = new GetPaymentByIdQuery
            {
                PaymentType = "membership",
                LawyerId = "nonexistent"
            };
            var handler = new GetPaymentByIdQueryHandler(_context);

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Null(result);
        }
    }
}