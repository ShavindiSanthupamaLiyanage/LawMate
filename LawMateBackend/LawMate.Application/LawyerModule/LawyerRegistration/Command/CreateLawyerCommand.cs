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

            bool emailExists = await _context.USER_DETAIL
                .AnyAsync(x => x.Email == dto.Email, cancellationToken);

            if (emailExists)
            {
                _logger.Warning($"Lawyer creation failed | Email already exists: {dto.Email}");
                throw new Exception("Email already exists.");
            }

            var user = new USER_DETAIL
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                UserName = dto.UserId,
                UserRole = UserRole.Lawyer,
                Email = dto.Email,
                NIC = dto.NIC,
                Password = CryptoUtil.Encrypt(dto.Password ?? "", dto.UserId),
                ContactNumber = dto.ContactNumber,
                RecordStatus = 1,
                RegistrationDate = DateTime.Now,
                CreatedBy = _currentUserService.UserId,
                CreatedAt = DateTime.Now
            };

            var lawyer = new LAWYER_DETAILS
            {
                UserId = dto.UserId,
                YearOfExperience = dto.YearOfExperience,
                WorkingDistrict = dto.WorkingDistrict,
                AreaOfPractice = dto.AreaOfPractice,
                VerificationStatus = VerificationStatus.Pending
            };

            _context.USER_DETAIL.Add(user);
            _context.LAWYER_DETAILS.Add(lawyer);

            await _context.SaveChangesAsync(cancellationToken);

            _logger.Info($"Lawyer created | UserId: {user.UserId}");

            return (user, lawyer);
        }
    }
}