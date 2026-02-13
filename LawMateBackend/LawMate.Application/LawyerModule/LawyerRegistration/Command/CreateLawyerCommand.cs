using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Command
{
    public class CreateLawyerCommand : IRequest<(USER_DETAIL User, LAWYER_DETAILS Lawyer)>
    {
        public CreateLawyerDto Data { get; set; }
    }

    public class CreateLawyerCommandHandler
    : IRequestHandler<CreateLawyerCommand, (USER_DETAIL User, LAWYER_DETAILS Lawyer)>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAppLogger _logger;

        public CreateLawyerCommandHandler(
            IApplicationDbContext context,
            ICurrentUserService currentUserService,
            IAppLogger logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<(USER_DETAIL User, LAWYER_DETAILS Lawyer)> Handle(
            CreateLawyerCommand request,
            CancellationToken cancellationToken)
        {
            _logger.Info("CreateLawyerCommand started");

            var dto = request.Data
                ?? throw new ArgumentNullException(nameof(request.Data));
            
            // Check existing accounts with same NIC
            var existingUsers = await _context.USER_DETAIL
                .Where(x => x.NIC == dto.NIC)
                .ToListAsync(cancellationToken);

            // Block if Lawyer already exists
            if (existingUsers.Any(x => x.UserRole == UserRole.Lawyer))
            {
                _logger.Warning($"Lawyer creation failed | Lawyer already exists for NIC: {dto.NIC}");
                throw new Exception("A Lawyer account already exists for this NIC.");
            }

            // Block if already 2 accounts (means Lawyer + Client already exist)
            if (existingUsers.Count == 2)
            {
                _logger.Warning($"Lawyer creation failed | NIC already has both accounts: {dto.NIC}");
                throw new Exception("This NIC already has both Lawyer and Client accounts.");
            }
            
            bool isDualAccount = false;
            // If a Client already exists for this NIC
            var existingClient = existingUsers
                .FirstOrDefault(x => x.UserRole == UserRole.Client);

            if (existingClient != null)
            {
                // This will become dual account
                isDualAccount = true;

                // Update existing client also
                existingClient.IsDualAccount = true;
                _logger.Info($"NIC {dto.NIC} now has dual accounts. Updating existing Client to IsDualAccount = true.");
            }

            bool emailExists = await _context.USER_DETAIL
                .AnyAsync(x => x.Email == dto.Email, cancellationToken);

            if (emailExists)
            {
                _logger.Warning($"Lawyer creation failed | Email already exists: {dto.Email}");
                throw new Exception("Email already exists.");
            }

            bool barRegExists = await _context.LAWYER_DETAILS
                .AnyAsync(x => x.BarAssociationRegNo == dto.BarAssociationRegNo, cancellationToken);

            if (barRegExists)
            {
                _logger.Warning($"Lawyer creation failed | BarAssociationRegNo already exists: {dto.BarAssociationRegNo}");
                throw new Exception("Bar Association Registration Number already exists.");
            }

            bool sceCertExists = await _context.LAWYER_DETAILS
                .AnyAsync(x => x.SCECertificateNo == dto.SCECertificateNo, cancellationToken);

            if (sceCertExists)
            {
                _logger.Warning($"Lawyer creation failed | SCECertificateNo already exists: {dto.SCECertificateNo}");
                throw new Exception("SCE Certificate Number already exists.");
            }
            
            var user = new USER_DETAIL
            {
                Prefix = dto.Prefix,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                UserName = dto.UserId,
                UserRole = UserRole.Lawyer,
                Email = dto.Email,
                NIC = dto.NIC,
                Password = CryptoUtil.Encrypt(dto.Password ?? "", dto.UserId),
                ContactNumber = dto.ContactNumber,
                RecordStatus = 0,
                State = State.Pending,
                RegistrationDate = DateTime.Now,
                ProfileImage = dto.ProfileImage,
                IsDualAccount = isDualAccount,
                CreatedBy = _currentUserService.UserId,
                CreatedAt = DateTime.Now
            };

            var lawyer = new LAWYER_DETAILS
            {
                UserId = dto.UserId,
                SCECertificateNo =dto.SCECertificateNo,
                Bio = dto.Bio,
                YearOfExperience = dto.YearOfExperience,
                WorkingDistrict = dto.WorkingDistrict,
                AreaOfPractice = dto.AreaOfPractice,
                VerificationStatus = VerificationStatus.Pending,
                BarAssociationMembership = dto.BarAssociationMembership,
                BarAssociationRegNo = dto.BarAssociationRegNo,
                OfficeContactNumber = dto.OfficeContactNumber,
                EnrollmentCertificate = dto.EnrollmentCertificate,
                NICFrontImage = dto.NICFrontImage,
                NICBackImage = dto.NICBackImage
            };

            _context.USER_DETAIL.Add(user);
            _context.LAWYER_DETAILS.Add(lawyer);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.Info($"Lawyer created | UserId: {user.UserId}");

            return (user, lawyer);
        }
    }
}