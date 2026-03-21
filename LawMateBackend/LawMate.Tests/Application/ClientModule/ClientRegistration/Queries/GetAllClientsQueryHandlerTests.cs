using System;
using System.Collections.Generic;
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
    public class GetAllClientsQueryHandlerTests
    {
        [Fact]
        public async Task Handle_ShouldReturnAllActiveClients()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldReturnAllActiveClients));

            var users = new List<USER_DETAIL>
            {
                new USER_DETAIL
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
                    RegistrationDate = DateTime.Now,
                    ProfileImage = null,
                    IsDualAccount = false
                },
                new USER_DETAIL
                {
                    UserId = "U2",
                    Prefix = Prefix.Ms,
                    FirstName = "Jane",
                    LastName = "Smith",
                    Email = "jane@test.com",
                    NIC = "NIC002",
                    Gender = Gender.Female,
                    ContactNumber = "654321",
                    RecordStatus = 0,
                    State = State.Active,
                    RegistrationDate = DateTime.Now,
                    ProfileImage = null,
                    IsDualAccount = false
                },
                new USER_DETAIL
                {
                    UserId = "U3",
                    Prefix = Prefix.Mr,
                    FirstName = "Inactive",
                    LastName = "User",
                    Email = "inactive@test.com",
                    NIC = "NIC003",
                    RecordStatus = 1, // inactive
                    State = State.Inactive
                }
            };

            var clients = new List<CLIENT_DETAILS>
            {
                new CLIENT_DETAILS
                {
                    UserId = "U1",
                    Address = "Address1",
                    District = "District1",
                    PrefferedLanguage = Language.English
                },
                new CLIENT_DETAILS
                {
                    UserId = "U2",
                    Address = "Address2",
                    District = "District2",
                    PrefferedLanguage = Language.Sinhala
                }
            };

            context.USER_DETAIL.AddRange(users);
            context.CLIENT_DETAILS.AddRange(clients);
            await context.SaveChangesAsync();

            var handler = new GetAllClientsQueryHandler(context);
            var query = new GetAllClientsQuery();

            // Act
            var result = await handler.Handle(query, CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count); // only active users

            var client1 = result.Find(c => c.UserId == "U1");
            Assert.NotNull(client1);
            Assert.Equal("John", client1.FirstName);
            Assert.Equal("Address1", client1.Address);
            Assert.Equal(Language.English, client1.PrefferedLanguage);

            var client2 = result.Find(c => c.UserId == "U2");
            Assert.NotNull(client2);
            Assert.Equal("Jane", client2.FirstName);
            Assert.Equal("Address2", client2.Address);
            Assert.Equal(Language.Sinhala, client2.PrefferedLanguage);
        }

        [Fact]
        public async Task Handle_ShouldReturnEmptyList_WhenNoActiveClients()
        {
            // Arrange
            var context = TestDbContextFactory.Create(nameof(Handle_ShouldReturnEmptyList_WhenNoActiveClients));

            var user = new USER_DETAIL
            {
                UserId = "U1",
                Prefix = Prefix.Mr,
                FirstName = "Inactive",
                LastName = "User",
                RecordStatus = 1 // inactive
            };

            var client = new CLIENT_DETAILS
            {
                UserId = "U1",
                Address = "Address",
                District = "District",
                PrefferedLanguage = Language.English
            };

            context.USER_DETAIL.Add(user);
            context.CLIENT_DETAILS.Add(client);
            await context.SaveChangesAsync();

            var handler = new GetAllClientsQueryHandler(context);

            // Act
            var result = await handler.Handle(new GetAllClientsQuery(), CancellationToken.None);

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result); // no active clients
        }
    }
}