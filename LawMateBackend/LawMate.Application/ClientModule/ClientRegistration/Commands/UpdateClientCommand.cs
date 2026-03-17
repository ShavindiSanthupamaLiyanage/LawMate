using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
    public class UpdateClientCommand : IRequest<string>
    {
        public string UserId { get; set; } = default!;

        // USER_DETAIL fields
        public Prefix Prefix { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public Gender? Gender { get; set; }
        public string? Email { get; set; }
        public string? ContactNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Nationality { get; set; }

        // CLIENT_DETAILS fields
        public string? Address { get; set; }
        public string? District { get; set; }
        public Language PrefferedLanguage { get; set; }
    }

    public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommand, string>
    {
        private readonly IApplicationDbContext _context;

        public UpdateClientCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<string> Handle(UpdateClientCommand request, CancellationToken cancellationToken)
        {
            // 1) Load USER_DETAIL
            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(
                    x => x.UserId == request.UserId && x.RecordStatus == 0,
                    cancellationToken);

            if (user == null)
                throw new KeyNotFoundException("Client not found");

            // 2) Optional: email uniqueness check (only if email provided & changed)
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var emailExists = await _context.USER_DETAIL.AnyAsync(
                    x => x.Email == request.Email
                         && x.RecordStatus == 0
                         && x.UserId != request.UserId,
                    cancellationToken);

                if (emailExists)
                    throw new Exception("Email already registered.");
            }

            // 3) Load CLIENT_DETAILS (create if missing)
            var client = await _context.CLIENT_DETAILS
                .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

            if (client == null)
            {
                client = new CLIENT_DETAILS
                {
                    UserId = request.UserId
                };
                _context.CLIENT_DETAILS.Add(client);
            }

            // 4) Update USER_DETAIL fields
            user.Prefix = request.Prefix;
            user.FirstName = request.FirstName?.Trim();
            user.LastName = request.LastName?.Trim();
            if (request.Gender.HasValue)
                user.Gender = request.Gender.Value;
            user.Email = request.Email?.Trim();
            user.ContactNumber = request.ContactNumber?.Trim();
            if (request.DateOfBirth.HasValue)
                user.DateOfBirth = request.DateOfBirth.Value.Date;
            user.Nationality = string.IsNullOrWhiteSpace(request.Nationality)
                ? user.Nationality
                : request.Nationality.Trim();
            user.UserName = $"{user.FirstName} {user.LastName}".Trim();

            // 5) Update CLIENT_DETAILS fields
            client.Address = request.Address?.Trim();
            client.District = request.District?.Trim();
            client.PrefferedLanguage = request.PrefferedLanguage;

            // 6) Save
            await _context.SaveChangesAsync(cancellationToken);

            return "Client updated successfully";
        }
    }
}