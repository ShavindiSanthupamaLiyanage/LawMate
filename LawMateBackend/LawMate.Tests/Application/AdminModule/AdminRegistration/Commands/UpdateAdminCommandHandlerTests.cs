using FluentAssertions;
using LawMate.Application.AdminModule.AdminRegistration.Commands;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Tests.Common;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.AdminRegistration.Commands;

public class UpdateAdminCommandHandlerTests
{
    [Fact]
    public async Task Handle_Should_Update_Admin_And_Return_True()
    {
        // Arrange
        var context = TestDbContextFactory.Create(nameof(Handle_Should_Update_Admin_And_Return_True));

        context.USER_DETAIL.Add(new USER_DETAIL
        {
            UserId = "U1",
            FirstName = "Old",
            LastName = "Name",
            Email = "old@test.com",
            NIC = "OLDNIC",
            ContactNumber = "000",
            Prefix = Prefix.Mr
        });

        await context.SaveChangesAsync();

        var handler = new UpdateAdminCommandHandler(context);

        var command = new UpdateAdminCommand
        {
            UserId = "U1",
            Prefix = Prefix.Ms,
            FirstName = "New",
            LastName = "Admin",
            Email = "new@test.com",
            NIC = "NEWNIC", // will be ignored
            ContactNumber = "111"
        };

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().BeTrue();

        var updated = await context.USER_DETAIL
            .FirstOrDefaultAsync(x => x.UserId == "U1");

        updated!.FirstName.Should().Be("New");
        updated.LastName.Should().Be("Admin");
        updated.Email.Should().Be("new@test.com");
        updated.ContactNumber.Should().Be("111");
        updated.Prefix.Should().Be(Prefix.Ms);
        updated.NIC.Should().Be("OLDNIC");
    }

    [Fact]
    public async Task Handle_Should_Throw_Exception_When_Admin_Not_Found()
    {
        // Arrange
        var context = TestDbContextFactory.Create(nameof(Handle_Should_Throw_Exception_When_Admin_Not_Found));

        var handler = new UpdateAdminCommandHandler(context);

        var command = new UpdateAdminCommand
        {
            UserId = "INVALID"
        };

        // Act
        var act = async () => await handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<Exception>()
            .WithMessage("Admin not found");
    }
}