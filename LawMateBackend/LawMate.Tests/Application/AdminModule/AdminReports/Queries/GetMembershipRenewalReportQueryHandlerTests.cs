using LawMate.Application.AdminModule.AdminReports.Queries;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Tests.Application.AdminModule.AdminReports.Queries;

public class GetMembershipRenewalReportQueryHandlerTests
{
    private readonly ApplicationDbContext _context;
    private readonly GetMembershipRenewalReportQueryHandler _handler;

    public GetMembershipRenewalReportQueryHandlerTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _handler = new GetMembershipRenewalReportQueryHandler(_context);

        SeedData();
    }

    private void SeedData()
    {
        var today = DateTime.Now;

        var lawyer = new USER_DETAIL
        {
            UserId = "lawyer1",
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane@test.com",
            ContactNumber = "0771234567",
            UserRole = UserRole.Lawyer
        };

        _context.USER_DETAIL.Add(lawyer);

        _context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
        {
            UserId = "lawyer1",
            WorkingDistrict = District.Colombo,
            AreaOfPractice = AreaOfPractice.Criminal,
            AverageRating = 6
        });

        // Membership - Expiring in 5 days
        _context.MEMBERSHIP_PAYMENT.Add(new MEMBERSHIP_PAYMENT
        {
            LawyerId = "lawyer1",
            MembershipStartDate = today.AddMonths(-11),
            MembershipEndDate = today.AddDays(5),
            Amount = 5000,
            PaymentStatus = PaymentStatus.Paid,
            VerificationStatus = VerificationStatus.Verified,
            IsExpired = false
        });

        // Another renewal (to test count)
        _context.MEMBERSHIP_PAYMENT.Add(new MEMBERSHIP_PAYMENT
        {
            LawyerId = "lawyer1",
            MembershipStartDate = today.AddYears(-2),
            MembershipEndDate = today.AddYears(-1),
            Amount = 4000,
            PaymentStatus = PaymentStatus.Paid,
            VerificationStatus = VerificationStatus.Verified,
            IsExpired = true
        });

        _context.SaveChanges();
    }
    
    [Fact]
    public async Task Handle_ShouldReturnLawyerMembershipData()
    {
        var result = (await _handler.Handle(
            new GetMembershipRenewalReportQuery(),
            CancellationToken.None)).ToList();

        var record = result
            .First(x => x.UserId == "lawyer1" && x.MembershipEndDate.HasValue);

        Assert.Equal("lawyer1", record.UserId);
        Assert.Equal("Jane Smith", record.LawyerName);
        Assert.Equal("Colombo", record.WorkingDistrict);
    }
    
    [Fact]
    public async Task Handle_ShouldCalculateDaysUntilExpiryCorrectly()
    {
        // Act
        var result = (await _handler.Handle(
                new GetMembershipRenewalReportQuery(),
                CancellationToken.None))
            .ToList();

        var record = result
            .Where(x => x.UserId == "lawyer1" && x.MembershipEndDate.HasValue)
            .OrderByDescending(x => x.MembershipEndDate)
            .First();

        // Assert
        Assert.InRange(record.DaysUntilExpiry, 4, 6);
    }

    [Fact]
    public async Task Handle_ShouldSetStatus_ExpiringThisWeek()
    {
        var result = (await _handler.Handle(
            new GetMembershipRenewalReportQuery(),
            CancellationToken.None)).ToList();

        var record = result
            .Where(x => x.UserId == "lawyer1")
            .OrderByDescending(x => x.MembershipEndDate)
            .First();

        Assert.Equal("Expiring This Week", record.MembershipStatusLabel);
    }

    [Fact]
    public async Task Handle_ShouldCalculateTotalRenewals()
    {
        var result = (await _handler.Handle(
            new GetMembershipRenewalReportQuery(),
            CancellationToken.None)).First();

        Assert.Equal(2, result.TotalRenewals);
    }

    [Fact]
    public async Task Handle_ShouldMarkExpired_WhenPastDate()
    {
        // Arrange
        var lawyer2 = new USER_DETAIL
        {
            UserId = "lawyer2",
            FirstName = "Old",
            LastName = "Lawyer",
            UserRole = UserRole.Lawyer
        };

        _context.USER_DETAIL.Add(lawyer2);

        _context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
        {
            UserId = "lawyer2",
            WorkingDistrict = District.Kandy,
            AreaOfPractice = AreaOfPractice.Civil
        });

        _context.MEMBERSHIP_PAYMENT.Add(new MEMBERSHIP_PAYMENT
        {
            LawyerId = "lawyer2",
            MembershipStartDate = DateTime.Now.AddYears(-1),
            MembershipEndDate = DateTime.Now.AddDays(-1),
            IsExpired = true
        });

        _context.SaveChanges();

        // Act
        var result = (await _handler.Handle(
                new GetMembershipRenewalReportQuery(),
                CancellationToken.None))
            .First(x => x.UserId == "lawyer2");

        // Assert
        Assert.Equal("Expired", result.MembershipStatusLabel);
    }

    [Fact]
    public async Task Handle_ShouldHandleNoMembership()
    {
        // Arrange
        var lawyer3 = new USER_DETAIL
        {
            UserId = "lawyer3",
            FirstName = "No",
            LastName = "Membership",
            UserRole = UserRole.Lawyer
        };

        _context.USER_DETAIL.Add(lawyer3);

        _context.LAWYER_DETAILS.Add(new LAWYER_DETAILS
        {
            UserId = "lawyer3",
            WorkingDistrict = District.Galle,
            AreaOfPractice = AreaOfPractice.Commercial
        });

        _context.SaveChanges();

        // Act
        var result = (await _handler.Handle(
                new GetMembershipRenewalReportQuery(),
                CancellationToken.None))
            .First(x => x.UserId == "lawyer3");

        // Assert
        Assert.Equal(0, result.MembershipFee);
        Assert.False(result.IsExpired);
        Assert.Equal("Expired", result.MembershipStatusLabel); // because no end date
    }
}