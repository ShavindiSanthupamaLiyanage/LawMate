using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Queries
{
    public record GetAllLawyersQuery : IRequest<List<GetLawyerDto>>;

    public class GetAllLawyersQueryHandler
        : IRequestHandler<GetAllLawyersQuery, List<GetLawyerDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllLawyersQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<GetLawyerDto>> Handle(
            GetAllLawyersQuery request,
            CancellationToken cancellationToken)
        {
            return await (
                from u in _context.USER_DETAIL
                join l in _context.LAWYER_DETAILS on u.UserId equals l.UserId
                select new GetLawyerDto
                {
                    UserId = u.UserId!,
                    Prefix = u.Prefix,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    NIC = u.NIC,
                    Gender = u.Gender,
                    ContactNumber = u.ContactNumber,
                    RecordStatus = u.RecordStatus,
                    State = u.State,
                    RegistrationDate = u.RegistrationDate,
                    ProfileImage = u.ProfileImage,
                    IsDualAccount = u.IsDualAccount,
                    SCECertificateNo = l.SCECertificateNo,
                    Bio = l.Bio,
                    AverageRating = l.AverageRating,
                    YearOfExperience = l.YearOfExperience,
                    WorkingDistrict = l.WorkingDistrict,
                    AreaOfPractice = l.AreaOfPractice,
                    VerificationStatus = l.VerificationStatus,
                    BarAssociationMembership = l.BarAssociationMembership,
                    BarAssociationRegNo = l.BarAssociationRegNo,
                    OfficeContactNumber = l.OfficeContactNumber,
                    EnrollmentCertificate = l.EnrollmentCertificate,
                    NICFrontImage = l.NICFrontImage,
                    NICBackImage = l.NICBackImage,
                }
            ).ToListAsync(cancellationToken);
        }
    }
}
