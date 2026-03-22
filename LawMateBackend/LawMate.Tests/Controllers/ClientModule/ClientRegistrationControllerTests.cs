using LawMate.API.Controllers.ClientModule;
using LawMate.Application.ClientModule.ClientRegistration.Commands;
using LawMate.Application.ClientModule.ClientRegistration.Queries;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.ClientModule
{
    public class ClientRegistrationControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly ClientRegistrationController _controller;

        public ClientRegistrationControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new ClientRegistrationController(_mediatorMock.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithListOfClients()
        {
            // Arrange
            var clients = new List<GetClientDto>
            {
                new GetClientDto { UserId = "U1", FirstName = "John" },
                new GetClientDto { UserId = "U2", FirstName = "Jane" }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetAllClientsQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(clients);

            // Act
            var result = await _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedClients = Assert.IsType<List<GetClientDto>>(okResult.Value);
            Assert.Equal(2, returnedClients.Count);
        }

        [Fact]
        public async Task GetByUserId_ReturnsOkResult_WithClient()
        {
            // Arrange
            var client = new GetClientDto { UserId = "U1", FirstName = "John" };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetClientByUserIdQuery>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(client);

            // Act
            var result = await _controller.GetByUserId("U1");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returnedClient = Assert.IsType<GetClientDto>(okResult.Value);
            Assert.Equal("U1", returnedClient.UserId);
        }

        [Fact]
        public async Task Update_ReturnsBadRequest_WhenUserIdMismatch()
        {
            // Arrange
            var command = new UpdateClientCommand { UserId = "U2" };

            // Act
            var result = await _controller.Update("U1", command);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("UserId mismatch", badRequest.Value);
        }

        [Fact]
        public async Task Update_ReturnsOkResult_WhenSuccessful()
        {
            // Arrange
            var command = new UpdateClientCommand { UserId = "U1" };
            _mediatorMock.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                         .ReturnsAsync("Client updated successfully");

            // Act
            var result = await _controller.Update("U1", command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Client updated successfully", okResult.Value);
        }

        [Fact]
        public async Task SuspendClient_ReturnsBadRequest_WhenUserIdMismatch()
        {
            // Arrange
            var command = new SuspendClientCommand { UserId = "U2" };

            // Act
            var result = await _controller.SuspendClient("U1", command);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal("UserId mismatch", badRequest.Value);
        }

        [Fact]
        public async Task SuspendClient_ReturnsOk_WhenSuccessful()
        {
            // Arrange
            var command = new SuspendClientCommand { UserId = "U1" };
            _mediatorMock.Setup(m => m.Send(command, It.IsAny<CancellationToken>()))
                         .ReturnsAsync("Client suspended successfully");

            // Act
            var result = await _controller.SuspendClient("U1", command);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal("Client suspended successfully", okResult.Value);
        }
    }
}