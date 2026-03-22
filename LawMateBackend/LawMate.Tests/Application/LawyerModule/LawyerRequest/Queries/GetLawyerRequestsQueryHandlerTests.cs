using LawMate.Application.LawyerModule.LawyerRequest.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRequest.Queries
{
    public class GetLawyerRequestsQueryHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Return_Requests_By_Status()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "C1",
                FirstName = "John",
                LastName = "Doe",
                ContactNumber = "123"
            });

            context.CLIENT_DETAILS.Add(new CLIENT_DETAILS
            {
                UserId = "C1"
            });

            context.BOOKING.AddRange(
                new BOOKING
                {
                    BookingId = 1,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-10)
                },
                new BOOKING
                {
                    BookingId = 2,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Accepted,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestsQueryHandler(context);

            // Act
            var result = await handler.Handle(
                new GetLawyerRequestsQuery("L1", BookingStatus.Pending),
                CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal(BookingStatus.Pending, result.First().Status);
        }

        [Fact]
        public async Task Handle_Should_Return_Confirmed_And_Accepted_When_Filter_Is_Confirmed()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "C1",
                FirstName = "Jane",
                LastName = "Doe"
            });

            context.CLIENT_DETAILS.Add(new CLIENT_DETAILS
            {
                UserId = "C1"
            });

            context.BOOKING.AddRange(
                new BOOKING
                {
                    BookingId = 1,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Confirmed,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-5)
                },
                new BOOKING
                {
                    BookingId = 2,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Accepted,
                    CreatedAt = DateTime.UtcNow
                },
                new BOOKING
                {
                    BookingId = 3,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Pending
                }
            );

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestsQueryHandler(context);

            // Act
            var result = (await handler.Handle(
                new GetLawyerRequestsQuery("L1", BookingStatus.Confirmed),
                CancellationToken.None)).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Contains(result, x => x.Status == BookingStatus.Confirmed);
            Assert.Contains(result, x => x.Status == BookingStatus.Accepted);
        }

        [Fact]
        public async Task Handle_Should_Order_By_CreatedAt_Descending()
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

            context.BOOKING.AddRange(
                new BOOKING
                {
                    BookingId = 1,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Pending,
                    CreatedAt = DateTime.UtcNow.AddMinutes(-10)
                },
                new BOOKING
                {
                    BookingId = 2,
                    LawyerId = "L1",
                    ClientId = "C1",
                    BookingStatus = BookingStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                }
            );

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestsQueryHandler(context);

            // Act
            var result = (await handler.Handle(
                new GetLawyerRequestsQuery("L1", BookingStatus.Pending),
                CancellationToken.None)).ToList();

            // Assert
            Assert.Equal(2, result.Count);
            Assert.Equal(2, result[0].BookingId); // newest first
            Assert.Equal(1, result[1].BookingId);
        }

        [Fact]
        public async Task Handle_Should_Return_Empty_When_No_Data()
        {
            // Arrange
            var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());

            var handler = new GetLawyerRequestsQueryHandler(context);

            // Act
            var result = await handler.Handle(
                new GetLawyerRequestsQuery("L1", BookingStatus.Pending),
                CancellationToken.None);

            // Assert
            Assert.Empty(result);
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
                ContactNumber = null
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
                BookingStatus = BookingStatus.Pending,
                IssueDescription = null,
                CreatedAt = null
            });

            await context.SaveChangesAsync();

            var handler = new GetLawyerRequestsQueryHandler(context);

            // Act
            var result = (await handler.Handle(
                new GetLawyerRequestsQuery("L1", BookingStatus.Pending),
                CancellationToken.None)).First();

            // Assert
            Assert.Equal(string.Empty, result.CaseType);
            Assert.Equal(string.Empty, result.Phone);
            Assert.NotEqual(default, result.CreatedAt); // fallback to UtcNow
        }
    }
}