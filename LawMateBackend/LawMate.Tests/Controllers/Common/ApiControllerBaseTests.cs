using FluentAssertions;
using LawMate.API.Controllers.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Moq;

namespace LawMate.Tests.Controllers.Common;

public class ApiControllerBaseTests
{
    private class TestController : ApiControllerBase
        {
            public ISender GetMediatorInstance()
            {
                return Mediator;
            }
        }

        [Fact]
        public void Mediator_Should_Be_Resolved_From_HttpContext()
        {
            // Arrange
            var mediatorMock = new Mock<ISender>();

            var services = new ServiceCollection();
            services.AddSingleton(mediatorMock.Object);

            var serviceProvider = services.BuildServiceProvider();

            var httpContext = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };

            var controller = new TestController
            {
                ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
                {
                    HttpContext = httpContext
                }
            };

            // Act
            var mediator = controller.GetMediatorInstance();

            // Assert
            mediator.Should().NotBeNull();
            mediator.Should().Be(mediatorMock.Object);
        }

        [Fact]
        public void Mediator_Should_Return_Same_Instance_When_Called_Multiple_Times()
        {
            // Arrange
            var mediatorMock = new Mock<ISender>();

            var services = new ServiceCollection();
            services.AddSingleton(mediatorMock.Object);

            var serviceProvider = services.BuildServiceProvider();

            var httpContext = new DefaultHttpContext
            {
                RequestServices = serviceProvider
            };

            var controller = new TestController
            {
                ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
                {
                    HttpContext = httpContext
                }
            };

            // Act
            var mediator1 = controller.GetMediatorInstance();
            var mediator2 = controller.GetMediatorInstance();

            // Assert
            mediator1.Should().BeSameAs(mediator2);
        }
}