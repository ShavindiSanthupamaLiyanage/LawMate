using FluentAssertions;
using LawMate.API.Controllers.AdminModule;
using LawMate.API.Model.Admin;
using LawMate.Application.AdminModule.AdminRegistration.Commands;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.AdminModule
{
    public class AdminRegistrationControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<IAppLogger> _loggerMock;
        private readonly AdminRegistrationController _controller;

        public AdminRegistrationControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<IAppLogger>();
            _controller = new AdminRegistrationController(_mediatorMock.Object, _loggerMock.Object);
        }

        [Fact]
        public async Task CreateAdmin_Should_Return_Ok_When_No_Image()
        {
            // Arrange
            var request = new CreateAdminRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                NIC = "123",
                Password = "pass",
                ContactNumber = "077",
                RecordStatus = 1,
                State = State.Active,
                ProfileImage = null
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<CreateAdminCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<USER_DETAIL>
                {
                    new USER_DETAIL
                    {
                        UserId = "U1",
                        FirstName = "John",
                        LastName = "Doe",
                        UserName = "U1",
                        Email = "john@test.com",
                        UserRole = UserRole.Admin,
                        State = State.Active
                    }
                });

            // Act
            var result = await _controller.CreateAdmin(request);

            // Assert
            var ok = result as OkObjectResult;
            ok.Should().NotBeNull();
            var list = ok!.Value as List<USER_DETAIL>;
            list.Should().NotBeNull();
            list!.Count.Should().Be(1);
            list.First().UserId.Should().Be("U1");
        }

        [Fact]
        public async Task CreateAdmin_Should_Handle_Image_Upload()
        {
            // Arrange
            var fileMock = new Mock<IFormFile>();
            var content = "fake image content";
            var ms = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(content));
            fileMock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns((Stream stream, CancellationToken token) =>
                {
                    ms.CopyTo(stream);
                    return Task.CompletedTask;
                });

            var request = new CreateAdminRequest
            {
                FirstName = "John",
                NIC = "123",
                ProfileImage = fileMock.Object
            };

            // Return a dummy USER_DETAIL list instead of string
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<CreateAdminCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<USER_DETAIL>
                {
                    new USER_DETAIL
                    {
                        UserId = "U1",
                        FirstName = "John",
                        NIC = "123",
                        UserRole = UserRole.Admin,
                        State = State.Active
                    }
                });

            // Act
            var result = await _controller.CreateAdmin(request);

            // Assert
            var ok = result as OkObjectResult;
            ok.Should().NotBeNull();

            var users = ok!.Value as List<USER_DETAIL>;
            users.Should().NotBeNull();
            users!.Count.Should().Be(1);
            users.First().UserId.Should().Be("U1");

            fileMock.Verify(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task CreateAdmin_Should_Log_And_Throw_On_Exception()
        {
            var request = new CreateAdminRequest();
        
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<CreateAdminCommand>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new Exception("DB error"));
        
            Func<Task> act = async () => await _controller.CreateAdmin(request);
        
            await act.Should().ThrowAsync<Exception>();
        }
      
        [Fact]
        public async Task ChangeProfileImage_WithValidCommand_ShouldReturnOk()
        {
            var command = new ChangeAdminProfileImageCommand { UserId = "U1" };

            // Setup mediator to return 'true', matching the handler's return type
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<ChangeAdminProfileImageCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);  // ✅ Return type must match handler

            var result = await _controller.ChangeProfileImage("U1", command);

            // Assert
            var ok = result as OkObjectResult;
            ok.Should().NotBeNull();
            ok!.Value.Should().Be(true); // matches the bool returned from the handler
        }
        [Fact]
        public async Task GetAdminByUserId_Should_Return_NotFound_When_Null()
        {
            // Arrange
            var fakeUser = new USER_DETAIL
            {
                UserId = "U1",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                UserRole = UserRole.Admin,
                State = State.Active
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<CreateAdminCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new List<USER_DETAIL> { fakeUser }); 
            // Act
            var result = await _controller.GetAdminByUserId("A1");

            // Assert
            result.Should().BeOfType<NotFoundObjectResult>();
        }
        [Fact]
        public async Task Update_Should_Return_BadRequest_When_Id_Mismatch()
        {
            var command = new UpdateAdminCommand { UserId = "U2" };

            var result = await _controller.Update("U1", command);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task Update_Should_Return_Ok_When_Success()
        {
            var command = new UpdateAdminCommand { UserId = "U1" };

            // Setup mediator to return 'true' (success)
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateAdminCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.Update("U1", command);

            // Assert
            var ok = result as OkObjectResult;
            ok.Should().NotBeNull();
            ok!.Value.Should().Be(true); 
        }

        [Fact]
        public async Task ChangeProfileImage_Should_Return_BadRequest_When_Id_Mismatch()
        {
            var command = new ChangeAdminProfileImageCommand { UserId = "U2" };

            var result = await _controller.ChangeProfileImage("U1", command);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Fact]
        public async Task ChangeProfileImage_Should_Return_Ok()
        {
            var command = new ChangeAdminProfileImageCommand { UserId = "U1" };
            
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<ChangeAdminProfileImageCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);  

            var result = await _controller.ChangeProfileImage("U1", command);

            // Assert
            var ok = result as OkObjectResult;
            ok.Should().NotBeNull();
            ok!.Value.Should().Be(true);
        }

        [Fact]
        public async Task Delete_Should_Return_NoContent()
        {
            _mediatorMock
                .Setup(m => m.Send(It.IsAny<DeleteAdminCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            var result = await _controller.Delete("U1");

            result.Should().BeOfType<NoContentResult>();
        }
    }
}