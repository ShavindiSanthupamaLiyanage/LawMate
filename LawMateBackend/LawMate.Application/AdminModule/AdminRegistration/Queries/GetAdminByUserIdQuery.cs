using LawMate.Application.Common.Interfaces;
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

namespace LawMate.Application.AdminModule.AdminRegistration.Queries
{
    public class GetAdminByUserIdQuery : IRequest<CreateAdminDto?>
    {
        public string UserId { get; set; }
    }

    public class GetAdminByUserIdQueryHandler : IRequestHandler<GetAdminByUserIdQuery, CreateAdminDto?>
    {
        private readonly IApplicationDbContext _context;
        private readonly IAppLogger _logger;

        public GetAdminByUserIdQueryHandler(IApplicationDbContext context,
            IAppLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<CreateAdminDto?> Handle(GetAdminByUserIdQuery request, CancellationToken cancellationToken)
        {
            _logger.Info($"Fetching admin | UserId: {request.UserId}");

            var admin = await _context.USER_DETAIL
                .AsNoTracking()
                .FirstOrDefaultAsync(x =>
                    x.UserRole == UserRole.Admin &&
                    x.UserId == request.UserId,
                    cancellationToken);

            if (admin == null)
            {
                _logger.Warning($"Admin not found | UserId: {request.UserId}");
                return null;
            }

            _logger.Info($"Admin retrieved | UserId: {request.UserId}");

            return new CreateAdminDto
            {
                UserId = admin.UserId,
                FirstName = admin.FirstName,
                LastName = admin.LastName,
                Email = admin.Email,
                NIC = admin.NIC,
                PhoneNumber = admin.PhoneNumber,
                RecordStatus = admin.RecordStatus,
                RegistrationDate = admin.RegistrationDate,
                LastLoginDate = admin.LastLoginDate,
                State = admin.State,
                CreatedBy = admin.CreatedBy,
                CreatedAt = admin.CreatedAt,
                ModifiedBy = admin.ModifiedBy,
                ModifiedAt = admin.ModifiedAt
            };
        }
    }

}

