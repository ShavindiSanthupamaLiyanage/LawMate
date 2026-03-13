using LawMate.Application.Common.Interfaces;
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
            var result = await (
                from u in _context.USER_DETAIL
                join c in _context.CLIENT_DETAILS on u.UserId equals c.UserId
                where u.UserId == request.UserId && u.RecordStatus == 0
                select new GetClientDto
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

                    Address = c.Address,
                    District = c.District,
                    PrefferedLanguage = c.PrefferedLanguage
                }
            ).FirstOrDefaultAsync(cancellationToken);

            if (result == null)
                throw new KeyNotFoundException("Client not found");

            return result;
        }
    }
}