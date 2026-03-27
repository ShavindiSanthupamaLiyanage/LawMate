using MediatR;
using Microsoft.EntityFrameworkCore;
using LawMate.Application.Common.Interfaces;
using LawMate.Application.AdminModule.AdminDashboard.DTOs;
using LawMate.Domain.Common.Enums;

namespace LawMate.Application.AdminModule.AdminDashboard.Queries
{
    public record GetAdminDashboardQuery : IRequest<AdminDashboardDto>;
    
    public class GetAdminDashboardQueryHandler
        : IRequestHandler<GetAdminDashboardQuery, AdminDashboardDto>
    {
        private readonly IApplicationDbContext _context;

        public GetAdminDashboardQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardDto> Handle(
            GetAdminDashboardQuery request,
            CancellationToken cancellationToken)
        {
            var today = DateTime.Today;
            
            var totalLawyers = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Lawyer, cancellationToken);

            var totalClients = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Client, cancellationToken);

            var activeMemberships = await _context.MEMBERSHIP_PAYMENT
                .CountAsync(m => m.VerificationStatus == VerificationStatus.Verified && !m.IsExpired, cancellationToken);

            var expiredMemberships = await _context.MEMBERSHIP_PAYMENT
                .CountAsync(m => m.IsExpired, cancellationToken);
            
            var bookingRevenue = await _context.BOOKING
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => (decimal?)b.Amount, cancellationToken) ?? 0;

            var membershipRevenue = await _context.MEMBERSHIP_PAYMENT
                .Where(m => m.VerificationStatus == VerificationStatus.Verified)
                .SumAsync(m => (decimal?)m.Amount, cancellationToken) ?? 0;

            var totalRevenue = bookingRevenue + membershipRevenue;
            
            var thisMonthBookingRevenue = await _context.BOOKING
                .Where(b =>
                    b.PaymentStatus == PaymentStatus.Paid &&
                    b.ScheduledDateTime.Month == today.Month &&
                    b.ScheduledDateTime.Year == today.Year)
                .SumAsync(b => (decimal?)b.Amount, cancellationToken) ?? 0;

            var thisMonthMembershipRevenue = await _context.MEMBERSHIP_PAYMENT
                .Where(m =>
                    m.VerificationStatus == VerificationStatus.Verified &&
                    m.PaymentDate.HasValue &&
                    m.PaymentDate.Value.Month == today.Month &&
                    m.PaymentDate.Value.Year == today.Year)
                .SumAsync(m => (decimal?)m.Amount, cancellationToken) ?? 0;

            var thisMonthRevenue = thisMonthBookingRevenue + thisMonthMembershipRevenue;
            
            var categories = await _context.LAWYER_DETAILS
                .GroupBy(l => l.AreaOfPractice)
                .Select(g => new LawyerCategoryDto
                {
                    Category = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync(cancellationToken);
            
            var monthlyRevenue = await _context.BOOKING
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .GroupBy(b => new { b.ScheduledDateTime.Year, b.ScheduledDateTime.Month })
                .Select(g => new MonthlyRevenueDto
                {
                    Month = g.Key.Month.ToString(),
                    Revenue = g.Sum(x => x.Amount)
                })
                .OrderBy(x => x.Month)
                .ToListAsync(cancellationToken);

            var activities = await _context.USER_DETAIL
                .OrderByDescending(u => u.RegistrationDate)
                .Take(5)
                .Select(u => new ActivityDto
                {
                    Name = u.FirstName + " " + u.LastName,
                    Action = u.UserRole == UserRole.Lawyer
                        ? "registered as lawyer"
                        : u.UserRole == UserRole.Client
                            ? "registered as client"
                            : "registered as admin",
                    Time = u.RegistrationDate ?? DateTime.Now
                })
                .ToListAsync(cancellationToken);

            return new AdminDashboardDto
            {
                TotalLawyers = totalLawyers,
                TotalClients = totalClients,
                TotalRevenue = totalRevenue,
                ThisMonthRevenue = thisMonthRevenue,
                ActiveMemberships = activeMemberships,
                ExpiredMemberships = expiredMemberships,
                LawyerCategories = categories,
                MonthlyRevenue = monthlyRevenue,
                RecentActivities = activities
            };
        }
    }
}