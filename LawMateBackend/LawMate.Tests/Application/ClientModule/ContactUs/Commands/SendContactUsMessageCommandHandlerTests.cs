using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.ClientModule.ContactUs.Commands;
using LawMate.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace LawMate.Tests.Application.ClientModule.ContactUs.Commands
{
    public class SendContactUsMessageCommandHandlerTests
    {
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<IEmailTemplateService> _templateServiceMock;
        private readonly Mock<IConfiguration> _configurationMock;
        private readonly SendContactUsMessageCommandHandler _handler;

        public SendContactUsMessageCommandHandlerTests()
        {
            _emailServiceMock = new Mock<IEmailService>();
            _templateServiceMock = new Mock<IEmailTemplateService>();
            _configurationMock = new Mock<IConfiguration>();

            // Setup configuration values
            _configurationMock.Setup(c => c["Email:From"]).Returns("lawmate@example.com");
            _configurationMock.Setup(c => c["App:BaseUrl"]).Returns("https://lawmate.test");

            _templateServiceMock
                .Setup(t => t.LoadTemplate(It.IsAny<string>()))
                .Returns("<html><img src='{{LogoUrl}}'/><p>{{FullName}}</p><p>{{Subject}}</p></html>");

            _handler = new SendContactUsMessageCommandHandler(
                _emailServiceMock.Object,
                _configurationMock.Object,
                _templateServiceMock.Object
            );
        }

        [Fact]
        public async Task Handle_Should_Send_Both_Emails_And_Return_True()
        {
            // Arrange
            var command = new SendContactUsMessageCommand
            {
                FullName = "John Doe",
                Email = "john@example.com",
                Subject = "Test Subject",
                Message = "Hello, this is a test message"
            };

            // Act
            var result = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(result);

            // Verify first email sent to LawMate
            _emailServiceMock.Verify(
                e => e.SendAsync(
                    "lawmate@example.com",
                    $"Contact Us: {command.Subject}",
                    It.Is<string>(body => body.Contains(command.Message) && body.Contains(command.FullName))
                ),
                Times.Once
            );

            // Verify confirmation email sent to client
            _emailServiceMock.Verify(
                e => e.SendAsync(
                    command.Email,
                    "LawMate Support - We received your message",
                    It.Is<string>(template =>
                        template.Contains(command.FullName) &&
                        template.Contains(command.Subject) &&
                        template.Contains("https://lawmate.test/assets/logo.png")
                    )
                ),
                Times.Once
            );

            // Verify template loaded
            _templateServiceMock.Verify(t => t.LoadTemplate("ContactTemplate.html"), Times.Once);
        }
    }
}