using FluentAssertions;

using LawMate.Application.LawyerModule.LawyerRegistration.Command;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Reflection;

namespace LawMate.Tests.Application.LawyerModule.LawyerRegistration.Command
{
    public class CreateLawyerCommandHandlerTests
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ICurrentUserService> _currentUserServiceMock;
        private readonly Mock<IAppLogger> _loggerMock;

        public CreateLawyerCommandHandlerTests()
        {
            _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
            _currentUserServiceMock = new Mock<ICurrentUserService>();
            _loggerMock = new Mock<IAppLogger>();
            _currentUserServiceMock.Setup(c => c.UserId).Returns("SYSTEM");
        }

        private IFormFile CreateMockFile(byte[] content)
        {
            var ms = new MemoryStream(content);
            var mock = new Mock<IFormFile>();
            mock.Setup(f => f.Length).Returns(ms.Length);
            mock.Setup(f => f.CopyToAsync(It.IsAny<Stream>(), It.IsAny<CancellationToken>()))
                .Returns<Stream, CancellationToken>((stream, ct) =>
                {
                    ms.Position = 0;
                    return ms.CopyToAsync(stream, ct);
                });
            return mock.Object;
        }
        
        [Fact]
        public async Task Handle_Should_ThrowException_When_LawyerAlreadyExists()
        {
            // Arrange
            var existingLawyer = new USER_DETAIL
            {
                NIC = "123456789V",
                UserRole = UserRole.Lawyer
            };
            typeof(USER_DETAIL)
                .GetProperty("UserId", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public)!
                .SetValue(existingLawyer, "L1");

            _context.USER_DETAIL.Add(existingLawyer);
            await _context.SaveChangesAsync();

            var dto = new CreateLawyerDto { NIC = "123456789V", SCECertificateNo = "SCE001", BarAssociationRegNo = "BAR001" };
            var command = new CreateLawyerCommand { Data = dto };
            var handler = new CreateLawyerCommandHandler(_context, _currentUserServiceMock.Object, _loggerMock.Object);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<Exception>()
                .WithMessage("A Lawyer account already exists for this NIC.");
        }
        
        [Fact]
        public async Task Handle_Should_ThrowArgumentNullException_When_DataIsNull()
        {
            // Arrange
            var command = new CreateLawyerCommand { Data = null };
            var handler = new CreateLawyerCommandHandler(_context, _currentUserServiceMock.Object, _loggerMock.Object);

            // Act
            Func<Task> act = async () => await handler.Handle(command, CancellationToken.None);

            // Assert
            await act.Should().ThrowAsync<ArgumentNullException>();
        }
    }
}