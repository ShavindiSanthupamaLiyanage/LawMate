using FluentAssertions;
using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Command
{
    public class UpdateLawyerCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;

        public UpdateLawyerCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        }

        [Fact]
        public async Task Handle_Should_Update_User_And_Lawyer_When_They_Exist()
        {
            // Arrange
            var userId = "U100";

            var user = new USER_DETAIL
            {
                UserId = userId,
                ContactNumber = "0711111111"
            };

            var lawyer = new LAWYER_DETAILS
            {
                UserId = userId,
                Bio = "Old bio",
                YearOfExperience = 2,
                WorkingDistrict = District.Colombo,
                AreaOfPractice = AreaOfPractice.Civil,
                OfficeContactNumber = "0110000000"
            };

            _context.USER_DETAIL.Add(user);
            _context.LAWYER_DETAILS.Add(lawyer);
            await _context.SaveChangesAsync();

            var command = new UpdateLawyerCommand
            {
                UserId = userId,
                ContactNumber = "0777777777",
                Bio = "Updated bio",
                YearOfExperience = 10,
                WorkingDistrict = District.Galle,
                AreaOfPractice = AreaOfPractice.Criminal,
                OfficeContactNumber = "0119999999"
            };

            var handler = new UpdateLawyerCommandHandler(_context);

            // Act
            var result = await handler.Handle(command, CancellationToken.None);

            // Assert returned values
            result.User.ContactNumber.Should().Be("0777777777");

            result.Lawyer.Bio.Should().Be("Updated bio");
            result.Lawyer.YearOfExperience.Should().Be(10);
            result.Lawyer.WorkingDistrict.Should().Be(District.Galle);
            result.Lawyer.AreaOfPractice.Should().Be(AreaOfPractice.Criminal);
            result.Lawyer.OfficeContactNumber.Should().Be("0119999999");

            // Assert DB persistence
            var userFromDb = await _context.USER_DETAIL.FirstOrDefaultAsync(x => x.UserId == userId);
            var lawyerFromDb = await _context.LAWYER_DETAILS.FirstOrDefaultAsync(x => x.UserId == userId);

            userFromDb!.ContactNumber.Should().Be("0777777777");

            lawyerFromDb!.Bio.Should().Be("Updated bio");
            lawyerFromDb.YearOfExperience.Should().Be(10);
            lawyerFromDb.WorkingDistrict.Should().Be(District.Galle);
            lawyerFromDb.AreaOfPractice.Should().Be(AreaOfPractice.Criminal);
            lawyerFromDb.OfficeContactNumber.Should().Be("0119999999");
        }

        [Fact]
        public async Task Handle_Should_ThrowException_When_Lawyer_Not_Found()
        {
            // Arrange
            var command = new UpdateLawyerCommand
            {
                UserId = "UnknownUser",
                ContactNumber = "0770000000",
                Bio = "Test"
            };

            var handler = new UpdateLawyerCommandHandler(_context);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<KeyNotFoundException>()
                .WithMessage("Lawyer not found");
        }
    }
}