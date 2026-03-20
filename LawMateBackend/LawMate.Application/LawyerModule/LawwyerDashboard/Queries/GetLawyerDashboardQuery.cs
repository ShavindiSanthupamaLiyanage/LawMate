using MediatR;
using Microsoft.EntityFrameworkCore;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs.Lawyer;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;

namespace LawMate.Application.LawyerModule.LawyerDashboard.Queries
{
    public record GetLawyerDashboardQuery(string LawyerId) : IRequest<LawyerDashboardDto>;

    public class GetLawyerDashboardQueryHandler 
        : IRequestHandler<GetLawyerDashboardQuery, LawyerDashboardDto>
    {
        private readonly IApplicationDbContext _context;

        public GetLawyerDashboardQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LawyerDashboardDto> Handle(
    GetLawyerDashboardQuery request,
    CancellationToken cancellationToken)
{
    // 1. total appointments
    var totalAppointments = await _context.BOOKING
        .CountAsync(b => b.LawyerId == request.LawyerId, cancellationToken);

    // 2. total revenue
    var totalRevenue = await _context.BOOKING_PAYMENT
        .Where(p => p.LawyerId == request.LawyerId
                    && p.IsPaid
                    && p.VerificationStatus == VerificationStatus.Verified)
        .SumAsync(p => (decimal?)p.LawyerFee, cancellationToken);

    // 3. appointment breakdown (RAW)
    var appointmentBreakdownRaw = await (
        from b in _context.BOOKING
        join l in _context.LAWYER_DETAILS on b.LawyerId equals l.UserId
        where b.LawyerId == request.LawyerId
        group b by l.AreaOfPractice into g
        select new
        {
            Category = g.Key,
            Count = g.Count()
        }
    ).ToListAsync(cancellationToken);

    // map to DTO
    var appointmentBreakdown = appointmentBreakdownRaw
        .Select(x => new AppointmentBreakdownDto
        {
            Category = x.Category.ToString(),
            Count = x.Count
        })
        .ToList();

    // 4. recent activities
    var recentActivities = await (
        from b in _context.BOOKING
        join u in _context.USER_DETAIL on b.ClientId equals u.UserId
        where b.LawyerId == request.LawyerId && u.RecordStatus == 0
        orderby (b.CreatedAt ?? b.ScheduledDateTime) descending
        select new LawyerActivityDto
        {
            BookingId = b.BookingId,
            Title = string.IsNullOrWhiteSpace(b.IssueDescription)
                ? "Untitled Issue"
                : b.IssueDescription,

            CaseNumber = $"LC{DateTime.Now.Year}-{b.BookingId:D3}",

            ClientName = ((u.FirstName ?? "") + " " + (u.LastName ?? "")).Trim(),

            Status = b.BookingStatus.ToString(),

            FiledDate = b.CreatedAt ?? b.ScheduledDateTime,

            ClientImage = u.ProfileImage != null
                ? Convert.ToBase64String(u.ProfileImage)
                : null
        }
    )
    .Take(5)
    .ToListAsync(cancellationToken);

    return new LawyerDashboardDto
    {
        Summary = new LawyerDashboardSummaryDto
        {
            TotalAppointments = totalAppointments,
            TotalRevenue = totalRevenue ?? 0
        },
        AppointmentBreakdown = appointmentBreakdown,
        RecentActivities = recentActivities
    };
}
    }
}