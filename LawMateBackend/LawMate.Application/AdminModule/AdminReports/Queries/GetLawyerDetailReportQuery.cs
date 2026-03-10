using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminReports.Queries;

public record GetLawyerDetailReportQuery : IRequest<IEnumerable<LawyerDetailReportDto>>;

public class GetLawyerDetailReportQueryHandler
    : IRequestHandler<GetLawyerDetailReportQuery, IEnumerable<LawyerDetailReportDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyerDetailReportQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<LawyerDetailReportDto>> Handle(
        GetLawyerDetailReportQuery request,
        CancellationToken cancellationToken)
    {
        var result = await (
            from ud in _context.USER_DETAIL
            join ld in _context.LAWYER_DETAILS on ud.UserId equals ld.UserId
            where ud.UserRole == UserRole.Lawyer // Lawyer role only

            // Left join: active + approved membership
            join mp in _context.MEMBERSHIP_PAYMENT
                           .Where(m => !m.IsExpired && m.VerificationStatus == VerificationStatus.Verified)
                on ld.UserId equals mp.LawyerId into mpGroup
            from mp in mpGroup.DefaultIfEmpty()

            select new
            {
                // User
                ud.UserId,
                ud.Prefix,
                ud.FirstName,
                ud.LastName,
                ud.Email,
                ud.ContactNumber,
                ud.Gender,
                ud.NIC,
                ud.RegistrationDate,
                ud.LastLoginDate,
                ud.State,

                // Lawyer
                ld.SCECertificateNo,
                ld.Bio,
                ld.ProfessionalDesignation,
                ld.YearOfExperience,
                ld.WorkingDistrict,
                ld.AreaOfPractice,
                ld.OfficeContactNumber,
                ld.BarAssociationMembership,
                ld.BarAssociationRegNo,
                ld.AverageRating,
                ld.VerificationStatus,
                ld.VerifiedAt,
                ld.VerifiedBy,
                ld.RejectedReason,

                // Membership (nullable — left join)
                MembershipStartDate = (DateTime?)mp.MembershipStartDate,
                MembershipEndDate   = (DateTime?)mp.MembershipEndDate,
                MembershipExpired   = (bool?)mp.IsExpired,
            })
            .ToListAsync(cancellationToken);
        
        var mapped = result.Select(r =>  new LawyerDetailReportDto
            {
                // User
                UserId           = r.UserId,
                Prefix           = r.Prefix.ToString(),
                FirstName        = r.FirstName,
                LastName         = r.LastName,
                Email            = r.Email,
                ContactNumber    = r.ContactNumber,
                Gender           = r.Gender.ToString(),
                NIC              = r.NIC,
                RegistrationDate = r.RegistrationDate ?? DateTime.MinValue,
                LastLoginDate    = r.LastLoginDate,
                State            = r.State.ToString(),

                // Lawyer
                SCECertificateNo         = r.SCECertificateNo,
                Bio                      = r.Bio,
                ProfessionalDesignation  = r.ProfessionalDesignation,
                YearOfExperience         = r.YearOfExperience,
                WorkingDistrict          = r.WorkingDistrict.ToString(),
                AreaOfPractice           = r.AreaOfPractice.ToString(),
                OfficeContactNumber      = r.OfficeContactNumber,
                BarAssociationMembership = r.BarAssociationMembership ?? false,
                BarAssociationRegNo      = r.BarAssociationRegNo,
                AverageRating            = r.AverageRating,
                VerificationStatus       = r.VerificationStatus.ToString(),
                VerifiedAt               = r.VerifiedAt,
                VerifiedBy               = r.VerifiedBy,
                RejectedReason           = r.RejectedReason,

                // Membership
                MembershipStartDate = r.MembershipStartDate,
                MembershipEndDate   = r.MembershipEndDate,
                MembershipExpired   = r.MembershipExpired,
            // };
        })
        .OrderByDescending(r => r.RegistrationDate)
        .ToList();

        return mapped;
    }
}