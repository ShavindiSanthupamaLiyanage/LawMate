using LawMate.Application.AdminModule.PaymentMaintenance.Queries;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities;
using LawMate.Domain.DTOs;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using Xunit;

namespace LawMate.Tests.Application.AdminModule.PaymentMaintenance.Queries
{
    public class GetPaymentsQueryHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public GetPaymentsQueryHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_ShouldReturnAllPayments_WhenNoStatusFilter()
        {
            // Arrange
            var booking = new BOOKING { BookingId = 1, ClientId = "client-1", LawyerId = "lawyer-1", BookingStatus = BookingStatus.Pending };
            var bookingPayment = new BOOKING_PAYMENT { Id = 1, BookingId = 1, TransactionId = "B1", Amount = 100, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Pending };
            var membershipPayment = new MEMBERSHIP_PAYMENT { Id = 1, LawyerId = "lawyer-2", TransactionId = "M1", Amount = 200, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Verified };

            _context.BOOKING.Add(booking);
            _context.BOOKING_PAYMENT.Add(bookingPayment);
            _context.MEMBERSHIP_PAYMENT.Add(membershipPayment);
            await _context.SaveChangesAsync();

            var query = new GetPaymentsQuery { Status = null };
            var handler = new GetPaymentsQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, x => x.PaymentType == "Booking" && x.TransactionId == "B1");
            Assert.Contains(result, x => x.PaymentType == "Membership" && x.TransactionId == "M1");
        }

        [Fact]
        public async Task Handle_ShouldReturnFilteredPayments_WhenStatusFilter()
        {
            // Arrange
            var booking = new BOOKING { BookingId = 2, ClientId = "client-2", LawyerId = "lawyer-2", BookingStatus = BookingStatus.Pending };
            var bookingPayment1 = new BOOKING_PAYMENT { Id = 2, BookingId = 2, TransactionId = "B2", Amount = 150, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Verified };
            var bookingPayment2 = new BOOKING_PAYMENT { Id = 3, BookingId = 2, TransactionId = "B3", Amount = 50, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Rejected };
            var membershipPayment = new MEMBERSHIP_PAYMENT { Id = 2, LawyerId = "lawyer-3", TransactionId = "M2", Amount = 300, PaymentDate = DateTime.UtcNow, VerificationStatus = VerificationStatus.Verified };

            _context.BOOKING.Add(booking);
            _context.BOOKING_PAYMENT.AddRange(bookingPayment1, bookingPayment2);
            _context.MEMBERSHIP_PAYMENT.Add(membershipPayment);
            await _context.SaveChangesAsync();

            var query = new GetPaymentsQuery { Status = VerificationStatus.Verified };
            var handler = new GetPaymentsQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Equal(2, result.Count);
            Assert.All(result, x => Assert.Equal(VerificationStatus.Verified, x.VerificationStatus));
            Assert.Contains(result, x => x.TransactionId == "B2");
            Assert.Contains(result, x => x.TransactionId == "M2");
        }

        [Fact]
        public async Task Handle_ShouldReturnEmptyList_WhenNoPaymentsExist()
        {
            // Arrange
            var query = new GetPaymentsQuery { Status = VerificationStatus.Pending };
            var handler = new GetPaymentsQueryHandler(_context);

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Empty(result);
        }
    }
}