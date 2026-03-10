using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminReports.Queries;

public class GetFinancialSummaryReportQuery : IRequest<IEnumerable<FinancialSummaryReportDto>>
{
}
public class GetFinancialSummaryReportQueryHandler
    : IRequestHandler<GetFinancialSummaryReportQuery, IEnumerable<FinancialSummaryReportDto>>
{
    private readonly IApplicationDbContext _context;
    public GetFinancialSummaryReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<IEnumerable<FinancialSummaryReportDto>> Handle(GetFinancialSummaryReportQuery request, CancellationToken cancellationToken)
    {
        var today = DateTime.Today;
        var report = new FinancialSummaryReportDto
        {
            TotalBookings = await _context.BOOKING.CountAsync(cancellationToken),
            TotalBookingRevenue = await _context.BOOKING
                .Where(b => b.PaymentStatus == PaymentStatus.Paid)
                .SumAsync(b => (decimal?)b.Amount, cancellationToken) ?? 0,
            PendingBookingRevenue = await _context.BOOKING
                .Where(b => b.PaymentStatus == PaymentStatus.Pending)
                .SumAsync(b => (decimal?)b.Amount, cancellationToken) ?? 0,
    
            TotalMemberships = await _context.MEMBERSHIP_PAYMENT
                .CountAsync(mp => mp.VerificationStatus == VerificationStatus.Verified, cancellationToken),
            TotalMembershipRevenue = await _context.MEMBERSHIP_PAYMENT
                .Where(mp => mp.VerificationStatus == VerificationStatus.Verified)
                .SumAsync(mp => (decimal?)mp.Amount, cancellationToken) ?? 0,
            ActiveMemberships = await _context.MEMBERSHIP_PAYMENT
                .CountAsync(mp => mp.VerificationStatus == VerificationStatus.Verified && !mp.IsExpired, cancellationToken),
    
            TotalClients = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Client, cancellationToken),
            TotalLawyers = await _context.USER_DETAIL
                .CountAsync(u => u.UserRole == UserRole.Lawyer, cancellationToken),
            VerifiedLawyers = await _context.LAWYER_DETAILS
                .CountAsync(ld => ld.VerificationStatus == VerificationStatus.Verified, cancellationToken),
    
            CompletedConsultations = await _context.CONSULTATION
                .CountAsync(c => c.IsCompleted == true, cancellationToken),
            OngoingConsultations = await _context.CONSULTATION
                .CountAsync(c => c.ConsultationStatus == ConsultationStatus.InProgress, cancellationToken),
    
            ThisMonthBookingRevenue = await _context.BOOKING
                .Where(b => b.PaymentStatus == PaymentStatus.Paid &&
                            b.ScheduledDateTime.Month == today.Month &&
                            b.ScheduledDateTime.Year == today.Year)
                .SumAsync(b => (decimal?)b.Amount, cancellationToken) ?? 0,
            ThisMonthMembershipRevenue = await _context.MEMBERSHIP_PAYMENT
                .Where(mp => mp.VerificationStatus == VerificationStatus.Verified &&
                             mp.PaymentDate.HasValue &&
                             mp.PaymentDate.Value.Month == today.Month &&
                             mp.PaymentDate.Value.Year == today.Year)
                .SumAsync(mp => (decimal?)mp.Amount, cancellationToken) ?? 0
        };
    
        return new List<FinancialSummaryReportDto> { report };
    }
}