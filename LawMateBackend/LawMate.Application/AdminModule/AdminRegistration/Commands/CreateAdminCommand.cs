using LawMate.Application.Common.Interfaces;
using LawMate.Application.Common.Utilities;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Application.AdminModule.AdminRegistration.Commands
{

    public class CreateAdminCommand : IRequest<List<USER_DETAIL>>
    {
        public CreateAdminDto Data { get; set; }
    }

    public class CreateAdminCommandHandler : IRequestHandler<CreateAdminCommand, List<USER_DETAIL>>
    {
        private readonly IApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService; 
        private readonly IAppLogger _logger;

        public CreateAdminCommandHandler(IApplicationDbContext context, 
            ICurrentUserService currentUserService,
            IAppLogger logger)
        {
            _context = context;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task<List<USER_DETAIL>> Handle(CreateAdminCommand request, CancellationToken cancellationToken)
        {
            _logger.Info($"CreateAdminCommand started");

            var dto = request.Data;
            if (dto == null)
            {
                _logger.Warning("CreateAdminCommand received null DTO");
                return new List<USER_DETAIL>();
            }

            bool emailExists = await _context.USER_DETAIL
                .AnyAsync(x => x.Email == dto.Email, cancellationToken);

            if (emailExists)
            {
                _logger.Warning($"Admin creation failed | Email already exists: {dto.Email}");
                throw new Exception("Email already exists.");
            }

            var entity = new USER_DETAIL
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                UserName= dto.UserId,
                UserRole = UserRole.Admin,
                Email = dto.Email,
                NIC = dto.NIC,
                Password = CryptoUtil.Encrypt(dto.Password ?? "", dto.UserId ?? ""),
                PhoneNumber = dto.PhoneNumber,
                RecordStatus = dto.RecordStatus,
                RegistrationDate = DateTime.Now,
                State = dto.State,
                ProfileImage = dto.ProfileImage,
                CreatedBy = _currentUserService.UserId,
                CreatedAt = DateTime.Now,
            };

            _context.USER_DETAIL.Add(entity);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.Info($"Admin created | UserId: {entity.UserId}");
            return new List<USER_DETAIL> { entity };
        }
    }
}
