using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminReports.Queries;

public class GetPlatformCommissionReportQuery : IRequest<IEnumerable<PlatformCommissionReportDto>>
{
}

public class GetPlatformCommissionReportQueryHandler
    : IRequestHandler<GetPlatformCommissionReportQuery, IEnumerable<PlatformCommissionReportDto>>
{
    private readonly IApplicationDbContext _context;
    private const decimal CommissionRate = 10m; // 10%

    public GetPlatformCommissionReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PlatformCommissionReportDto>> Handle(
        GetPlatformCommissionReportQuery request,
        CancellationToken cancellationToken)
    {
        var query = from b in _context.BOOKING
                    join uc in _context.USER_DETAIL on b.ClientId equals uc.UserId
                    join ul in _context.USER_DETAIL on b.LawyerId equals ul.UserId
                    join ld in _context.LAWYER_DETAILS on b.LawyerId equals ld.UserId
                    join bp in _context.BOOKING_PAYMENT on b.BookingId equals bp.BookingId into bpGroup
                    from bp in bpGroup.DefaultIfEmpty()
                    where b.PaymentStatus == PaymentStatus.Paid
                    select new PlatformCommissionReportDto
                    {
                        BookingId = b.BookingId,
                        ScheduledDateTime = b.ScheduledDateTime,

                        ClientName = uc.FirstName + " " + uc.LastName,
                        ClientEmail = uc.Email,

                        LawyerName = ul.FirstName + " " + ul.LastName,
                        LawyerEmail = ul.Email,
                        AreaOfPractice = ld.AreaOfPractice.ToString(),
                        WorkingDistrict = ld.WorkingDistrict.ToString(),

                        Duration = b.Duration,
                        BookingAmount = b.Amount,
                        PlatformCommission = Math.Round(b.Amount * CommissionRate / 100, 2),
                        LawyerPayout = Math.Round(b.Amount - (b.Amount * CommissionRate / 100), 2),

                        BookingStatus = b.BookingStatus.ToString(),
                        PaymentStatus = b.PaymentStatus.ToString(),

                        TransactionId = bp != null ? bp.TransactionId : null,
                        PaymentDate = bp != null ? bp.PaymentDate : null,
                        PaymentVerificationStatus = bp != null ? bp.VerificationStatus.ToString() : null
                    };

        return await query
            .OrderByDescending(x => x.ScheduledDateTime)
            .ToListAsync(cancellationToken);
    }
}