using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientDashboard.Queries
{
    public record GetClientDashboardHomeQuery(string ClientId) : IRequest<ClientDashboardHomeDto>;

    public class GetClientDashboardHomeQueryHandler
        : IRequestHandler<GetClientDashboardHomeQuery, ClientDashboardHomeDto>
    {
        private readonly IApplicationDbContext _context;

        public GetClientDashboardHomeQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ClientDashboardHomeDto> Handle(
            GetClientDashboardHomeQuery request,
            CancellationToken cancellationToken)
        {
            var totalAppointments = await _context.BOOKING
                .CountAsync(b => b.ClientId == request.ClientId, cancellationToken);

            var contactedLawyers = await _context.BOOKING
                .Where(b => b.ClientId == request.ClientId)
                .Select(b => b.LawyerId)
                .Distinct()
                .CountAsync(cancellationToken);

            var appointmentBreakdownRaw = await (
                from b in _context.BOOKING
                join l in _context.LAWYER_DETAILS on b.LawyerId equals l.UserId
                where b.ClientId == request.ClientId
                group b by l.AreaOfPractice into g
                select new
                {
                    Category = g.Key,
                    Count = g.Count()
                }
            ).ToListAsync(cancellationToken);

            var recentActivitiesRaw = await (
                from b in _context.BOOKING
                join l in _context.LAWYER_DETAILS on b.LawyerId equals l.UserId
                join u in _context.USER_DETAIL on l.UserId equals u.UserId
                where b.ClientId == request.ClientId && u.RecordStatus == 0
                orderby (b.CreatedAt ?? b.ScheduledDateTime) descending
                select new
                {
                    b.BookingId,
                    b.IssueDescription,
                    b.BookingStatus,
                    b.ScheduledDateTime,
                    b.CreatedAt,
                    u.FirstName,
                    u.LastName,
                    u.ProfileImage,
                    l.ProfessionalDesignation,
                    l.Bio
                }
            ).Take(2).ToListAsync(cancellationToken);

            var appointmentBreakdown = appointmentBreakdownRaw
                .Select(x => new AppointmentBreakdownDto
                {
                    Category = x.Category.ToString(),
                    Count = x.Count
                })
                .ToList();

            var recentActivities = recentActivitiesRaw
                .Select(x => new ClientActivityDto
                {
                    BookingId = x.BookingId,
                    Title = string.IsNullOrWhiteSpace(x.IssueDescription)
                        ? "Untitled Issue"
                        : x.IssueDescription,
                    CaseNumber = $"LC{DateTime.Now.Year}-{x.BookingId:D3}",
                    LawyerName = $"{x.FirstName} {x.LastName}".Trim(),
                    LawyerDetails = !string.IsNullOrWhiteSpace(x.ProfessionalDesignation)
                        ? x.ProfessionalDesignation!
                        : (x.Bio ?? string.Empty),
                    LawyerImage = x.ProfileImage,
                    Status = x.BookingStatus.ToString(),
                    FiledDate = x.CreatedAt ?? x.ScheduledDateTime
                })
                .ToList();

            return new ClientDashboardHomeDto
            {
                Summary = new ClientDashboardSummaryDto
                {
                    TotalAppointments = totalAppointments,
                    ContactedLawyers = contactedLawyers
                },
                AppointmentBreakdown = appointmentBreakdown,
                RecentActivities = recentActivities
            };
        }
    }
}