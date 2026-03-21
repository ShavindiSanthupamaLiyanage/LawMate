using FluentAssertions;
using LawMate.API.Controllers.Common;
using LawMate.API.Model.Common;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace LawMate.Tests.Controllers.Common
{
    public class EncryptionControllerTests
    {
        private readonly EncryptionController _controller;

        public EncryptionControllerTests()
        {
            _controller = new EncryptionController();
        }

        // Encrypt - BadRequest when Password empty
        [Fact]
        public void EncryptPassword_Should_Return_BadRequest_When_Password_Empty()
        {
            var request = new AuthLoginRequest
            {
                UserId = "user1",
                Password = ""
            };

            var result = _controller.EncryptPassword(request);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // Encrypt - BadRequest when UserId empty
        [Fact]
        public void EncryptPassword_Should_Return_BadRequest_When_UserId_Empty()
        {
            var request = new AuthLoginRequest
            {
                UserId = "",
                Password = "123"
            };

            var result = _controller.EncryptPassword(request);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // Encrypt - Success
        [Fact]
        public void EncryptPassword_Should_Return_Ok_When_Valid_Request()
        {
            var request = new AuthLoginRequest
            {
                UserId = "user1",
                Password = "123"
            };

            var result = _controller.EncryptPassword(request);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            okResult.StatusCode.Should().Be(200);
            okResult.Value.Should().NotBeNull();
        }

        // Decrypt - BadRequest when Password empty
        [Fact]
        public void DecryptPassword_Should_Return_BadRequest_When_Password_Empty()
        {
            var request = new AuthLoginRequest
            {
                UserId = "user1",
                Password = ""
            };

            var result = _controller.DecryptPassword(request);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // Decrypt - BadRequest when UserId empty
        [Fact]
        public void DecryptPassword_Should_Return_BadRequest_When_UserId_Empty()
        {
            var request = new AuthLoginRequest
            {
                UserId = "",
                Password = "encryptedValue"
            };

            var result = _controller.DecryptPassword(request);

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        // Decrypt - Success
        [Fact]
        public void DecryptPassword_Should_Return_Ok_When_Valid_Request()
        {
            var request = new AuthLoginRequest
            {
                UserId = "user1",
                Password = "encryptedValue"
            };

            var result = _controller.DecryptPassword(request);

            var okResult = result.Should().BeOfType<OkObjectResult>().Subject;

            okResult.StatusCode.Should().Be(200);
            okResult.Value.Should().NotBeNull();
        }
    }
}