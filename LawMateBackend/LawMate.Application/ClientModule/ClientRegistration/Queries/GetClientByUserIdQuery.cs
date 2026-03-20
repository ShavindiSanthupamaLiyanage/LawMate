﻿using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Queries
{
    public record GetClientByUserIdQuery(string UserId) : IRequest<GetClientDto>;

    public class GetClientByUserIdQueryHandler
        : IRequestHandler<GetClientByUserIdQuery, GetClientDto>
    {
        private readonly IApplicationDbContext _context;

        public GetClientByUserIdQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<GetClientDto> Handle(
            GetClientByUserIdQuery request,
            CancellationToken cancellationToken)
        {
            var user = await _context.USER_DETAIL
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == request.UserId && u.RecordStatus == 0, cancellationToken);

            if (user == null)
                throw new KeyNotFoundException("Client not found");

            var client = await _context.CLIENT_DETAILS
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == request.UserId, cancellationToken);

            var result = new GetClientDto
            {
                UserId = user.UserId!,
                Prefix = user.Prefix,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                NIC = user.NIC,
                Gender = user.Gender,
                ContactNumber = user.ContactNumber,
                RecordStatus = user.RecordStatus,
                State = user.State,
                RegistrationDate = user.RegistrationDate,
                ProfileImage = user.ProfileImage,
                IsDualAccount = user.IsDualAccount,

                Address = client?.Address,
                District = client?.District,
                PrefferedLanguage = client?.PrefferedLanguage ?? Language.English,
            };

            return result;
        }
    }
}