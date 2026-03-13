using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminReports.Queries;

public class GetMembershipRenewalReportQuery : IRequest<IEnumerable<MembershipRenewalReportDto>>;

public class GetMembershipRenewalReportQueryHandler
    : IRequestHandler<GetMembershipRenewalReportQuery, IEnumerable<MembershipRenewalReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMembershipRenewalReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MembershipRenewalReportDto>> Handle(
        GetMembershipRenewalReportQuery request,
        CancellationToken cancellationToken)
    {
        var today = DateTime.Now;

        var result = await (
            from ud in _context.USER_DETAIL
            join ld in _context.LAWYER_DETAILS on ud.UserId equals ld.UserId

            join mp in _context.MEMBERSHIP_PAYMENT
                on ld.UserId equals mp.LawyerId into mpGroup
            from mp in mpGroup.DefaultIfEmpty()

            where ud.UserRole == UserRole.Lawyer

            select new
            {
                ud.UserId,
                LawyerName = ud.FirstName + " " + ud.LastName,
                ud.Email,
                ud.ContactNumber,

                ld.WorkingDistrict,
                ld.AreaOfPractice,
                ld.AverageRating,

                MembershipStartDate = mp != null ? mp.MembershipStartDate : null,
                MembershipEndDate = mp != null ? mp.MembershipEndDate : null,
                Amount = mp != null ? (decimal?)mp.Amount : null,
                PaymentStatus = mp != null ? (PaymentStatus?)mp.PaymentStatus : null,
                VerificationStatus = mp != null ? (VerificationStatus?)mp.VerificationStatus : null,
                IsExpired = mp != null ? (bool?)mp.IsExpired : null,

                TotalRenewals = _context.MEMBERSHIP_PAYMENT
                    .Count(x => x.LawyerId == ld.UserId)
            })
            .ToListAsync(cancellationToken);

        var mapped = result.Select(r =>
        {
            int daysUntilExpiry = r.MembershipEndDate.HasValue
                ? (r.MembershipEndDate.Value - today).Days
                : 0;

            string status =
                r.IsExpired == true || daysUntilExpiry <= 0
                    ? "Expired"
                    : daysUntilExpiry <= 7
                        ? "Expiring This Week"
                        : daysUntilExpiry <= 30
                            ? "Expiring This Month"
                            : "Active";

            return new MembershipRenewalReportDto
            {
                UserId = r.UserId,
                LawyerName = r.LawyerName,
                Email = r.Email,
                ContactNumber = r.ContactNumber,

                WorkingDistrict = r.WorkingDistrict.ToString(),
                AreaOfPractice = r.AreaOfPractice.ToString(),
                AverageRating = r.AverageRating,

                MembershipStartDate = r.MembershipStartDate,
                MembershipEndDate = r.MembershipEndDate,

                MembershipFee = r.Amount ?? 0,
                PaymentStatus = r.PaymentStatus?.ToString(),
                VerificationStatus = r.VerificationStatus?.ToString(),
                IsExpired = r.IsExpired ?? false,

                DaysUntilExpiry = daysUntilExpiry,
                MembershipStatusLabel = status,

                TotalRenewals = r.TotalRenewals
            };
        })
        .OrderBy(r => r.MembershipEndDate)
        .ToList();

        return mapped;
    }
}