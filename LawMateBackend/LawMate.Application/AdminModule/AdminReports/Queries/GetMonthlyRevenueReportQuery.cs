using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminReports.Queries;

public class GetMonthlyRevenueReportQuery : IRequest<IEnumerable<MonthlyRevenueReportDto>>
{
}

public class GetMonthlyRevenueReportQueryHandler
    : IRequestHandler<GetMonthlyRevenueReportQuery, IEnumerable<MonthlyRevenueReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMonthlyRevenueReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MonthlyRevenueReportDto>> Handle(
        GetMonthlyRevenueReportQuery request,
        CancellationToken cancellationToken)
    {
        // Fetch bookings only (no Include needed)
        var bookings = await _context.BOOKING
            .AsNoTracking()
            .ToListAsync(cancellationToken); // bring to memory

        var report = bookings
            .GroupBy(b => new { b.ScheduledDateTime.Year, b.ScheduledDateTime.Month })
            .Select(g =>
            {
                var year = g.Key.Year;
                var month = g.Key.Month;

                return new MonthlyRevenueReportDto
                {
                    Year = year,
                    Month = month,
                    MonthName = new DateTime(year, month, 1).ToString("MMMM"),

                    TotalBookings = g.Count(),
                    CompletedBookings = g.Count(x => x.BookingStatus == BookingStatus.Verified),
                    CancelledBookings = g.Count(x => x.BookingStatus == BookingStatus.Rejected),

                    TotalRevenue = g.Where(x => x.PaymentStatus == PaymentStatus.Paid).Sum(x => x.Amount),
                    PendingRevenue = g.Where(x => x.PaymentStatus == PaymentStatus.Pending).Sum(x => x.Amount),

                    MembershipRevenue = _context.MEMBERSHIP_PAYMENT
                        .Where(mp => mp.VerificationStatus == VerificationStatus.Verified
                                     && mp.PaymentDate.HasValue
                                     && mp.PaymentDate.Value.Year == year
                                     && mp.PaymentDate.Value.Month == month)
                        .Sum(mp => mp.Amount),

                    NewLawyers = _context.USER_DETAIL
                        .Count(ud => ud.UserRole == UserRole.Lawyer
                                     && ud.RegistrationDate.HasValue
                                     && ud.RegistrationDate.Value.Year == year
                                     && ud.RegistrationDate.Value.Month == month)
                };
            })
            .OrderByDescending(x => x.Year)
            .ThenByDescending(x => x.Month)
            .ToList();

        return report;
    }
}