using LawMate.Application.LawyerModule.LawyerRequest.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRequest.Queries
{
    public class GetLawyerRequestByIdQueryHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Return_BookingDetail_When_Valid()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "C1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                ContactNumber = "123456",
                NIC = "NIC123",
                ProfileImage = new byte[] { 1, 2, 3 }
            });

            context.CLIENT_DETAILS.Add(new CLIENT_DETAILS
            {
                UserId = "C1",
                Address = "Colombo"
            });

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending,
                IssueDescription = "Case A",
                CreatedBy = "C1",
                ScheduledDateTime = DateTime.UtcNow,
                Duration = 60,
                PaymentMode = PaymentMode.Online,
                Location = "Office"
            });

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestByIdQueryHandler(context);

            var query = new GetLawyerRequestByIdQuery(1, "L1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(1, result.BookingId);
            Assert.Equal("John Doe", result.ClientName);
            Assert.Equal("john@test.com", result.Email);
            Assert.Equal("123456", result.Phone);
            Assert.Equal("NIC123", result.Nic);
            Assert.Equal("Colombo", result.Address);
            Assert.Equal("Case A", result.CaseType);
            Assert.Equal(BookingStatus.Pending, result.Status);
        }

        [Fact]
        public async Task Handle_Should_Return_Null_When_Not_Found()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            var handler = new GetLawyerRequestByIdQueryHandler(context);

            var query = new GetLawyerRequestByIdQuery(999, "L1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_Should_Return_Null_When_LawyerId_Does_Not_Match()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "C1",
                FirstName = "John",
                LastName = "Doe"
            });

            context.CLIENT_DETAILS.Add(new CLIENT_DETAILS
            {
                UserId = "C1"
            });

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending
            });

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestByIdQueryHandler(context);

            var query = new GetLawyerRequestByIdQuery(1, "L2"); // wrong lawyer

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task Handle_Should_Handle_Null_Fields_Correctly()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "C1",
                FirstName = "John",
                LastName = "Doe",
                Email = null,
                ContactNumber = null,
                NIC = null
            });

            context.CLIENT_DETAILS.Add(new CLIENT_DETAILS
            {
                UserId = "C1",
                Address = null
            });

            context.BOOKING.Add(new BOOKING
            {
                BookingId = 1,
                LawyerId = "L1",
                ClientId = "C1",
                BookingStatus = BookingStatus.Pending,
                IssueDescription = null
            });

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestByIdQueryHandler(context);

            var query = new GetLawyerRequestByIdQuery(1, "L1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(string.Empty, result.Email);
            Assert.Equal(string.Empty, result.Phone);
            Assert.Equal(string.Empty, result.Nic);
            Assert.Equal(string.Empty, result.Address);
            Assert.Equal(string.Empty, result.CaseType);
        }
    }
}