using System;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.ClientModule.ClientRegistration.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.DTOs;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LawMate.Tests.Application.ClientModule.ClientRegistration.Queries
{
    public class GetClientByUserIdQueryHandlerTests
    {
        [Fact]
        public async Task Handle_ShouldReturnClient_WhenExists()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldReturnClient_WhenExists));

            var user = new USER_DETAIL
            {
                UserId = "U1",
                Prefix = Prefix.Mr,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                NIC = "NIC001",
                Gender = Gender.Male,
                ContactNumber = "123456",
                RecordStatus = 0,
                State = State.Active,
                RegistrationDate = DateTime.Now
            };

            var client = new CLIENT_DETAILS
            {
                UserId = "U1",
                Address = "Address1",
                District = "District1",
                PrefferedLanguage = Language.English
            };

            context.USER_DETAIL.Add(user);
            context.CLIENT_DETAILS.Add(client);
            await context.SaveChangesAsync();

            var handler = new GetClientByUserIdQueryHandler(context);
            var query = new GetClientByUserIdQuery("U1");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("U1", result.UserId);
            Assert.Equal("John", result.FirstName);
            Assert.Equal("Address1", result.Address);
            Assert.Equal(Language.English, result.PrefferedLanguage);
        }

        [Fact]
        public async Task Handle_ShouldThrow_WhenUserNotFound()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldThrow_WhenUserNotFound));

            var handler = new GetClientByUserIdQueryHandler(context);
            var query = new GetClientByUserIdQuery("NonExistentUser");

            // Act & Assert
            var ex = await Assert.ThrowsAsync<KeyNotFoundException>(
                () => handler.Handle(query, CancellationToken.None)
            );
            Assert.Equal("Client not found", ex.Message);
        }

        [Fact]
        public async Task Handle_ShouldReturnClientWithDefaultLanguage_WhenClientDetailsMissing()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldReturnClientWithDefaultLanguage_WhenClientDetailsMissing));

            var user = new USER_DETAIL
            {
                UserId = "U2",
                Prefix = Prefix.Ms,
                FirstName = "Jane",
                LastName = "Doe",
                RecordStatus = 0,
                State = State.Active
            };

            context.USER_DETAIL.Add(user);
            await context.SaveChangesAsync();

            var handler = new GetClientByUserIdQueryHandler(context);
            var query = new GetClientByUserIdQuery("U2");

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("U2", result.UserId);
            Assert.Equal(Language.English, result.PrefferedLanguage); // default fallback
            Assert.Null(result.Address);
            Assert.Null(result.District);
        }
    }
}