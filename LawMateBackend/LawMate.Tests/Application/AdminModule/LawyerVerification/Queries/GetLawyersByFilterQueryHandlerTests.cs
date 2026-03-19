using LawMate.Application.AdminModule.LawyerVerification;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Domain.DTOs;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.AdminModule.LawyerVerification
{
    public class GetLawyersByFilterQueryHandlerTests
    {
        private readonly DbContextOptions<ApplicationDbContext> _options;

        public GetLawyersByFilterQueryHandlerTests()
        {
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;
        }

        private IApplicationDbContext CreateDbContext()
        {
            var context = new ApplicationDbContext(_options);

            // Seed fake users and lawyers
            context.USER_DETAIL.AddRange(
                new USER_DETAIL
                {
                    UserId = "lawyer1",
                    UserRole = UserRole.Lawyer,
                    FirstName = "Sunil",
                    LastName = "Gamage",
                    State = State.Active
                },
                new USER_DETAIL
                {
                    UserId = "lawyer2",
                    UserRole = UserRole.Lawyer,
                    FirstName = "Kamal",
                    LastName = "Perera",
                    State = State.Inactive
                }
            );

            context.LAWYER_DETAILS.AddRange(
                new LAWYER_DETAILS
                {
                    UserId = "lawyer1",
                    VerificationStatus = VerificationStatus.Pending
                },
                new LAWYER_DETAILS
                {
                    UserId = "lawyer2",
                    VerificationStatus = VerificationStatus.Verified
                }
            );

            context.SaveChanges();
            return context;
        }
    
        [Fact]
        public async Task Handle_ReturnsAllLawyers_WhenNoFilter()
        {
            var dbContext = CreateDbContext();
            var handler = new GetLawyersByFilterQueryHandler(dbContext);

            var query = new GetLawyersByVerificationStatusQuery(); // no filter
            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Equal(2, result.Count);
        }
        
        [Theory]
        [InlineData(VerificationStatus.Pending, 1)]
        [InlineData(VerificationStatus.Verified, 1)]
        [InlineData(VerificationStatus.Rejected, 0)]
        public async Task Handle_FiltersByVerificationStatus(VerificationStatus status, int expectedCount)
        {
            var dbContext = CreateDbContext();
            var handler = new GetLawyersByFilterQueryHandler(dbContext);

            var query = new GetLawyersByVerificationStatusQuery
            {
                VerificationStatus = status
            };

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Equal(expectedCount, result.Count);
            if (expectedCount > 0)
            {
                Assert.All(result, r => Assert.Equal(status, r.VerificationStatus));
            }
        }
        
        [Theory]
        [InlineData(State.Active, 1)]
        [InlineData(State.Inactive, 1)]
        public async Task Handle_FiltersByState(State state, int expectedCount)
        {
            var dbContext = CreateDbContext();
            var handler = new GetLawyersByFilterQueryHandler(dbContext);

            var query = new GetLawyersByVerificationStatusQuery
            {
                State = state
            };

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Equal(expectedCount, result.Count);
            if (expectedCount > 0)
            {
                Assert.All(result, r => Assert.Equal(state, r.State));
            }
        }
        
        [Fact]
        public async Task Handle_FiltersByVerificationStatusAndState()
        {
            var dbContext = CreateDbContext();
            var handler = new GetLawyersByFilterQueryHandler(dbContext);

            var query = new GetLawyersByVerificationStatusQuery
            {
                VerificationStatus = VerificationStatus.Pending,
                State = State.Active
            };

            var result = await handler.Handle(query, CancellationToken.None);

            Assert.Single(result);
            Assert.Equal("lawyer1", result[0].UserId);
            Assert.Equal(State.Active, result[0].State);
            Assert.Equal(VerificationStatus.Pending, result[0].VerificationStatus);
        }
    }
}