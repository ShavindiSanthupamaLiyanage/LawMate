using LawMate.Application.LawyerModule.LawyerSearch.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerSearch.Queries
{
    public class GetLawyerSearchDropdownsQueryHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Return_All_Dropdowns_Correctly()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_All_Dropdowns_Correctly));

            context.USER_DETAIL.AddRange(
                new USER_DETAIL
                {
                    UserId = "L1",
                    FirstName = "John",
                    LastName = "Doe",
                    UserRole = UserRole.Lawyer,
                    State = State.Active
                },
                new USER_DETAIL
                {
                    UserId = "L2",
                    FirstName = "Jane",
                    LastName = "Smith",
                    UserRole = UserRole.Lawyer,
                    State = State.Inactive // should be excluded
                }
            );

            context.LAWYER_DETAILS.AddRange(
                new LAWYER_DETAILS
                {
                    UserId = "L1",
                    VerificationStatus = VerificationStatus.Verified
                },
                new LAWYER_DETAILS
                {
                    UserId = "L2",
                    VerificationStatus = VerificationStatus.Verified
                }
            );

            await context.SaveChangesAsync();

            var handler = new GetLawyerSearchDropdownsQueryHandler(context);

            // Act
            var result = await handler.Handle(new GetLawyerSearchDropdownsQuery(), CancellationToken.None);

            // Assert

            // Lawyer Names
            Assert.Single(result.LawyerNames); // only L1 should be included
            Assert.Equal("L1", result.LawyerNames[0].Value);
            Assert.Equal("John Doe", result.LawyerNames[0].Label);

            // Areas Of Practice
            Assert.NotEmpty(result.AreasOfPractice);
            Assert.Equal(Enum.GetValues<AreaOfPractice>().Length, result.AreasOfPractice.Count);

            // Districts
            Assert.NotEmpty(result.Districts);
            Assert.Equal(Enum.GetValues<District>().Length, result.Districts.Count);
        }

        [Fact]
        public async Task Handle_Should_Exclude_Non_Verified_Lawyers()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Exclude_Non_Verified_Lawyers));

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                FirstName = "John",
                LastName = "Doe",
                UserRole = UserRole.Lawyer,
                State = State.Active
            });

            context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
            {
                UserId = "L1",
                VerificationStatus = VerificationStatus.Pending // should be excluded
            });

            await context.SaveChangesAsync();

            var handler = new GetLawyerSearchDropdownsQueryHandler(context);

            // Act
            var result = await handler.Handle(new GetLawyerSearchDropdownsQuery(), CancellationToken.None);

            // Assert
            Assert.Empty(result.LawyerNames);
        }

        [Fact]
        public async Task Handle_Should_Exclude_Non_Lawyer_Users()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Exclude_Non_Lawyer_Users));

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "U1",
                FirstName = "Admin",
                LastName = "User",
                UserRole = UserRole.Admin, // not a lawyer
                State = State.Active
            });

            context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
            {
                UserId = "U1",
                VerificationStatus = VerificationStatus.Verified
            });

            await context.SaveChangesAsync();

            var handler = new GetLawyerSearchDropdownsQueryHandler(context);

            // Act
            var result = await handler.Handle(new GetLawyerSearchDropdownsQuery(), CancellationToken.None);

            // Assert
            Assert.Empty(result.LawyerNames);
        }
    }
}