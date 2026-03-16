using FluentAssertions;
using LawMate.API.Controllers.ClientModule;
using LawMate.Application.ClientModule.ContactUs.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace LawMate.Tests.Controllers.ClientModule
{
    public class ContactUsControllerTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly ContactUsController _controller;

        public ContactUsControllerTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _controller = new ContactUsController(_mediatorMock.Object);
        }

        [Fact]
        public async Task SendContactMessage_Should_Return_Ok_When_Command_Succeeds()
        {
            // Arrange
            var command = new SendContactUsMessageCommand
            {
                FullName = "John Doe",
                Email = "john@test.com",
                Message = "Hello support"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<SendContactUsMessageCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act
            var result = await _controller.SendContactMessage(command);

            // Assert
            result.Should().BeOfType<OkObjectResult>();

            var okResult = result as OkObjectResult;

            okResult!.Value.Should().BeEquivalentTo(new
            {
                message = "Your message has been sent successfully."
            });

            _mediatorMock.Verify(
                m => m.Send(command, It.IsAny<CancellationToken>()),
                Times.Once);
        }
    }
}