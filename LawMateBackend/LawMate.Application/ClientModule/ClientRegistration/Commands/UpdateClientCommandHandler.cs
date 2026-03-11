using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientRegistration.Commands
{
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
                .FirstOrDefaultAsync(x => x.UserId == request.UserId && x.RecordStatus == 0, cancellationToken);

            if (user == null)
                throw new KeyNotFoundException("Client not found");

            // 2) Load CLIENT_DETAILS (create if missing)
            var client = await _context.CLIENT_DETAILS
                .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

            if (client == null)
            {
                client = new Domain.Entities.Auth.CLIENT_DETAILS
                {
                    UserId = request.UserId
                };
                _context.CLIENT_DETAILS.Add(client);
            }

            // 3) Update USER_DETAIL fields
            user.Prefix = request.Prefix;
            user.FirstName = request.FirstName?.Trim();
            user.LastName = request.LastName?.Trim();
            user.Gender = request.Gender;
            user.Email = request.Email?.Trim();
            user.ContactNumber = request.ContactNumber?.Trim();
            user.UserName = $"{request.FirstName} {request.LastName}".Trim();

            // 4) Update CLIENT_DETAILS fields
            client.Address = request.Address?.Trim();
            client.District = request.District?.Trim();
            client.PrefferedLanguage = request.PrefferedLanguage;

            // 5) Save
            await _context.SaveChangesAsync(cancellationToken);

            return "Client updated successfully";
        }
    }
}