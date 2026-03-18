using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Queries
{
    public record GetLawyerByUserIdQuery(string UserId) : IRequest<GetLawyerDto>;

    public class GetLawyerByUserIdQueryHandler
        : IRequestHandler<GetLawyerByUserIdQuery, GetLawyerDto>
    {
        private readonly IApplicationDbContext _context;

        public GetLawyerByUserIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GetLawyerDto> Handle(
            GetLawyerByUserIdQuery request,
            CancellationToken cancellationToken)
        {
            var user = await _context.USER_DETAIL
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == request.UserId, cancellationToken);

            if (user == null)
            if (user == null)
                throw new KeyNotFoundException("Lawyer not found");

            var lawyer = await _context.LAWYER_DETAILS
                .AsNoTracking()
                .FirstOrDefaultAsync(l => l.UserId == request.UserId, cancellationToken);

            var result = new GetLawyerDto
            {
                UserId = user.UserId!,
                Prefix = user.Prefix,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserName = user.UserName,
                Email = user.Email,
                NIC = user.NIC,
                Gender = user.Gender,
                UserRole = user.UserRole,
                ContactNumber = user.ContactNumber,
                RecordStatus = user.RecordStatus,
                State = user.State,
                RegistrationDate = user.RegistrationDate,
                LastLoginDate = user.LastLoginDate,
                ProfileImage = user.ProfileImage,
                IsDualAccount = user.IsDualAccount,

                SCECertificateNo = lawyer?.SCECertificateNo,
                Bio = lawyer?.Bio,
                AverageRating = lawyer?.AverageRating ?? 0,
                YearOfExperience = lawyer?.YearOfExperience ?? 0,
                WorkingDistrict = lawyer?.WorkingDistrict ?? District.Colombo,
                AreaOfPractice = lawyer?.AreaOfPractice ?? AreaOfPractice.Civil,
                VerificationStatus = lawyer?.VerificationStatus ?? VerificationStatus.Pending,
                BarAssociationRegNo = lawyer?.BarAssociationRegNo,
                OfficeContactNumber = lawyer?.OfficeContactNumber,
                EnrollmentCertificate = lawyer?.EnrollmentCertificate,
                NICFrontImage = lawyer?.NICFrontImage,
                NICBackImage = lawyer?.NICBackImage,
            };

            return result;
        }
    }
}
