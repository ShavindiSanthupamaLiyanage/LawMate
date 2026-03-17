using FluentAssertions;
using LawMate.Application.AdminModule.AdminRegistration.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using Moq;

namespace LawMate.Tests.Application.AdminModule.AdminRegistration.Commands
{
    public class CreateAdminCommandHandlerTests
    {
        private readonly Mock<IApplicationDbContext> _contextMock;
        private readonly Mock<ICurrentUserService> _currentUserMock;
        private readonly Mock<IAppLogger> _loggerMock;

        private readonly CreateAdminCommandHandler _handler;

        public CreateAdminCommandHandlerTests()
        {
            _contextMock = new Mock<IApplicationDbContext>();
            _currentUserMock = new Mock<ICurrentUserService>();
            _loggerMock = new Mock<IAppLogger>();

            _currentUserMock.Setup(x => x.UserId).Returns("SYSTEM");

            _handler = new CreateAdminCommandHandler(
                _contextMock.Object,
                _currentUserMock.Object,
                _loggerMock.Object);
        }

        [Fact]
        public async Task Handle_Should_Return_Empty_List_When_Dto_Is_Null()
        {
            // Arrange
            var command = new CreateAdminCommand
            {
                Data = null
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task Handle_Should_Create_Admin_And_Return_List()
        {
            // Arrange
            var dto = new CreateAdminDto
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                NIC = "123456789V",
                Password = "pass",
                ContactNumber = "077",
                RecordStatus = 1,
                ProfileImage = null,
                UserId = "U1"
            };

            var command = new CreateAdminCommand
            {
                Data = dto
            };

            _contextMock
                .Setup(x => x.USER_DETAIL.Add(It.IsAny<USER_DETAIL>()))
                .Callback<USER_DETAIL>(u =>
                {
                    u.UserId = "U1"; 
                });
            
            _contextMock
                .Setup(x => x.USER_DETAIL.Update(It.IsAny<USER_DETAIL>()));

            _contextMock
                .Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
                .ReturnsAsync(1);

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);

            var createdUser = result.First();

            createdUser.FirstName.Should().Be("John");
            createdUser.LastName.Should().Be("Doe");
            createdUser.Email.Should().Be("john@test.com");
            createdUser.UserRole.Should().Be(UserRole.Admin);
            createdUser.State.Should().Be(State.Active);

            _contextMock.Verify(x => x.USER_DETAIL.Add(It.IsAny<USER_DETAIL>()), Times.Once);
            _contextMock.Verify(x => x.USER_DETAIL.Update(It.IsAny<USER_DETAIL>()), Times.Once);
            
            _contextMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
            
        }
    }
}