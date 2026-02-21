using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.LawyerVerification;

public class GetLawyersByVerificationStatusQuery : IRequest<List<LawyerVerificationDto>>
{
    public VerificationStatus? VerificationStatus { get; set; }
    public State? State { get; set; }
}

public class GetLawyersByFilterQueryHandler 
    : IRequestHandler<GetLawyersByVerificationStatusQuery, List<LawyerVerificationDto>>
{
    private readonly IApplicationDbContext _context;

    public GetLawyersByFilterQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<LawyerVerificationDto>> Handle(
        GetLawyersByVerificationStatusQuery request, 
        CancellationToken cancellationToken)
    {
        var query = from user in _context.USER_DETAIL
                    join lawyer in _context.LAWYER_DETAILS
                        on user.UserId equals lawyer.UserId
                    where user.UserRole == UserRole.Lawyer
                    select new { user, lawyer };

        if (request.VerificationStatus.HasValue)
            query = query.Where(x => x.lawyer.VerificationStatus == request.VerificationStatus);

        if (request.State.HasValue)
            query = query.Where(x => x.user.State == request.State);

        return await query.Select(x => new LawyerVerificationDto
        {
            UserId = x.user.UserId,
            Prefix = x.user.Prefix.ToString(),
            FirstName = x.user.FirstName,
            LastName = x.user.LastName,
            UserName = x.user.UserName,
            Email = x.user.Email,
            NIC = x.user.NIC,
            ContactNumber = x.user.ContactNumber,
            RecordStatus = x.user.RecordStatus,
            RegistrationDate = x.user.RegistrationDate,
            LastLoginDate = x.user.LastLoginDate,
            State = x.user.State,
            UserRole = x.user.UserRole,
            ProfileImage = x.user.ProfileImage,
            IsDualAccount = x.user.IsDualAccount,

            SCECertificateNo = x.lawyer.SCECertificateNo,
            Bio = x.lawyer.Bio,
            BarAssociationMembership = x.lawyer.BarAssociationMembership,
            BarAssociationRegNo = x.lawyer.BarAssociationRegNo,
            ProfessionalDesignation = x.lawyer.ProfessionalDesignation,
            YearOfExperience = x.lawyer.YearOfExperience,
            WorkingDistrict = x.lawyer.WorkingDistrict,
            AreaOfPractice = x.lawyer.AreaOfPractice,
            OfficeContactNumber = x.lawyer.OfficeContactNumber,
            AverageRating = x.lawyer.AverageRating,
            EnrollmentCertificate = x.lawyer.EnrollmentCertificate,
            NICFrontImage = x.lawyer.NICFrontImage,
            NICBackImage = x.lawyer.NICBackImage,
            VerificationStatus = x.lawyer.VerificationStatus,
            VerifiedBy = x.lawyer.VerifiedBy,
            VerifiedAt = x.lawyer.VerifiedAt,
            RejectedReason = x.lawyer.RejectedReason
        }).ToListAsync(cancellationToken);
    }
}
