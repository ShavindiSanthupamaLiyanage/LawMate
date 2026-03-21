using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Infrastructure;
using LawMate.Tests.Common;

namespace LawMate.Tests.Application.AdminModule.AdminReports.Queries;

public class GetClientDetailReportQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetClientDetailReportQueryHandler _handler;

    public GetClientDetailReportQueryHandlerTests()
    {
        _context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        _handler = new GetClientDetailReportQueryHandler(_context);
    }

    private async Task SeedData()
    {
        _context.USER_DETAIL.AddRange(
            new USER_DETAIL
            {
                UserId = "client1",
                UserRole = UserRole.Client,
                Prefix = Prefix.Mr,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@test.com",
                ContactNumber = "123456789",
                Gender = Gender.Male,
                NIC = "123456789V",
                RegistrationDate = DateTime.UtcNow.AddDays(-2),
                LastLoginDate = DateTime.UtcNow,
                State = State.Active
            },
            new USER_DETAIL
            {
                UserId = "client2",
                UserRole = UserRole.Client,
                Prefix = Prefix.Ms,
                FirstName = "Jane",
                LastName = "Smith",
                Email = "jane@test.com",
                ContactNumber = "987654321",
                Gender = Gender.Female,
                NIC = "987654321V",
                RegistrationDate = DateTime.UtcNow.AddDays(-1),
                LastLoginDate = DateTime.UtcNow,
                State = State.Pending
            },
            new USER_DETAIL // should be ignored (not client)
            {
                UserId = "lawyer1",
                UserRole = UserRole.Lawyer
            }
        );

        _context.CLIENT_DETAILS.AddRange(
            new CLIENT_DETAILS
            {
                UserId = "client1",
                Address = "Address 1",
                District = District.Ampara.ToString(),
                PrefferedLanguage = Language.English
            },
            new CLIENT_DETAILS
            {
                UserId = "client2",
                Address = "Address 2",
                District = District.Gampaha.ToString(),
                PrefferedLanguage = Language.Sinhala
            }
        );

        await _context.SaveChangesAsync();
    }

    [Fact]
    public async Task Handle_ShouldReturnMappedClientDetails()
    {
        await SeedData();

        var result = await _handler.Handle(new GetClientDetailReportQuery(), CancellationToken.None);

        var list = result.ToList();

        Assert.Equal(2, list.Count);

        var client1 = list.First(x => x.UserId == "client1");
        Assert.Equal("Mr", client1.Prefix);
        Assert.Equal("John", client1.FirstName);
        Assert.Equal("Doe", client1.LastName);
        Assert.Equal("john@test.com", client1.Email);
        Assert.Equal("Male", client1.Gender);
        Assert.Equal("Active", client1.State);
        Assert.Equal("Ampara", client1.District);
        Assert.Equal("English", client1.PreferredLanguage);

        var client2 = list.First(x => x.UserId == "client2");
        Assert.Equal("Ms", client2.Prefix);
        Assert.Equal("Jane", client2.FirstName);
    }

    [Fact]
    public async Task Handle_ShouldReturnOnlyClients()
    {
        await SeedData();

        var result = await _handler.Handle(new GetClientDetailReportQuery(), CancellationToken.None);

        Assert.DoesNotContain(result, x => x.UserId == "lawyer1");
    }

    [Fact]
    public async Task Handle_ShouldOrderByRegistrationDateDescending()
    {
        await SeedData();

        var result = (await _handler.Handle(new GetClientDetailReportQuery(), CancellationToken.None)).ToList();

        Assert.True(result[0].RegistrationDate >= result[1].RegistrationDate);
    }

    [Fact]
    public async Task Handle_ShouldReturnEmpty_WhenNoData()
    {
        var result = await _handler.Handle(new GetClientDetailReportQuery(), CancellationToken.None);

        Assert.Empty(result);
    }
}