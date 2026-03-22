using LawMate.Application.LawyerModule.LawyerSearch.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Tests.Common;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerSearch.Queries
{
    public class SearchLawyerQueryHandlerTests
    {
        [Fact]
        public async Task Handle_Should_Return_All_Lawyers_When_No_Filter()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Return_All_Lawyers_When_No_Filter));

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
                VerificationStatus = VerificationStatus.Verified,
                AreaOfPractice = AreaOfPractice.Criminal,
                WorkingDistrict = District.Colombo,
                YearOfExperience = 5,
                AverageRating = 4.5m
            });

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            // Act
            var result = await handler.Handle(new SearchLawyerQuery(), CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("L1", result[0].LawyerId);
            Assert.Equal("John Doe", result[0].FullName);
        }

        [Fact]
        public async Task Handle_Should_Filter_By_AreaOfPractice()
        {
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Filter_By_AreaOfPractice));

            context.USER_DETAIL.AddRange(
                new USER_DETAIL { UserId = "L1", FirstName = "John", LastName = "Doe", UserRole = UserRole.Lawyer, State = State.Active },
                new USER_DETAIL { UserId = "L2", FirstName = "Jane", LastName = "Smith", UserRole = UserRole.Lawyer, State = State.Active }
            );

            context.LAWYER_DETAILS.AddRange(
                new LAWYER_DETAILS
                {
                    UserId = "L1",
                    VerificationStatus = VerificationStatus.Verified,
                    AreaOfPractice = AreaOfPractice.Criminal,
                    WorkingDistrict = District.Colombo
                },
                new LAWYER_DETAILS
                {
                    UserId = "L2",
                    VerificationStatus = VerificationStatus.Verified,
                    AreaOfPractice = AreaOfPractice.Civil,
                    WorkingDistrict = District.Colombo
                }
            );

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            // Act
            var result = await handler.Handle(new SearchLawyerQuery
            {
                AreaOfPractice = AreaOfPractice.Criminal
            }, CancellationToken.None);

            // Assert
            Assert.Single(result);
            Assert.Equal("L1", result[0].LawyerId);
        }

        [Fact]
        public async Task Handle_Should_Filter_By_District()
        {
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Filter_By_District));

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
                VerificationStatus = VerificationStatus.Verified,
                AreaOfPractice = AreaOfPractice.Criminal,
                WorkingDistrict = District.Kandy
            });

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            var result = await handler.Handle(new SearchLawyerQuery
            {
                District = District.Colombo
            }, CancellationToken.None);

            Assert.Empty(result);
        }

        [Fact]
        public async Task Handle_Should_Filter_By_NameSearch()
        {
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Filter_By_NameSearch));

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                FirstName = "John",
                LastName = "Fernando",
                UserRole = UserRole.Lawyer,
                State = State.Active
            });

            context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
            {
                UserId = "L1",
                VerificationStatus = VerificationStatus.Verified
            });

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            var result = await handler.Handle(new SearchLawyerQuery
            {
                NameSearch = "john"
            }, CancellationToken.None);

            Assert.Single(result);
        }

        [Fact]
        public async Task Handle_Should_Exclude_Inactive_Users()
        {
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Exclude_Inactive_Users));

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                FirstName = "John",
                LastName = "Doe",
                UserRole = UserRole.Lawyer,
                State = State.Inactive
            });

            context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
            {
                UserId = "L1",
                VerificationStatus = VerificationStatus.Verified
            });

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            var result = await handler.Handle(new SearchLawyerQuery(), CancellationToken.None);

            Assert.Empty(result);
        }

        [Fact]
        public async Task Handle_Should_Sort_By_Rating_Then_Experience()
        {
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Sort_By_Rating_Then_Experience));

            context.USER_DETAIL.AddRange(
                new USER_DETAIL { UserId = "L1", FirstName = "A", LastName = "One", UserRole = UserRole.Lawyer, State = State.Active },
                new USER_DETAIL { UserId = "L2", FirstName = "B", LastName = "Two", UserRole = UserRole.Lawyer, State = State.Active }
            );

            context.LAWYER_DETAILS.AddRange(
                new LAWYER_DETAILS
                {
                    UserId = "L1",
                    VerificationStatus = VerificationStatus.Verified,
                    AverageRating = 4.5m,
                    YearOfExperience = 10
                },
                new LAWYER_DETAILS
                {
                    UserId = "L2",
                    VerificationStatus = VerificationStatus.Verified,
                    AverageRating = 5.0m,
                    YearOfExperience = 2
                }
            );

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            var result = await handler.Handle(new SearchLawyerQuery(), CancellationToken.None);

            // L2 should come first (higher rating)
            Assert.Equal("L2", result[0].LawyerId);
            Assert.Equal("L1", result[1].LawyerId);
        }

        [Fact]
        public async Task Handle_Should_Map_ProfileImage_To_Base64()
        {
            var context = TestDbContextFactory.Create(nameof(Handle_Should_Map_ProfileImage_To_Base64));

            var imageBytes = new byte[] { 1, 2, 3 };

            context.USER_DETAIL.Add(new USER_DETAIL
            {
                UserId = "L1",
                FirstName = "John",
                LastName = "Doe",
                UserRole = UserRole.Lawyer,
                State = State.Active,
                ProfileImage = imageBytes
            });

            context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
            {
                UserId = "L1",
                VerificationStatus = VerificationStatus.Verified
            });

            await context.SaveChangesAsync();

            var handler = new SearchLawyerQueryHandler(context);

            var result = await handler.Handle(new SearchLawyerQuery(), CancellationToken.None);

            Assert.NotNull(result[0].ProfileImageBase64);
            Assert.Equal(Convert.ToBase64String(imageBytes), result[0].ProfileImageBase64);
        }
    }
}