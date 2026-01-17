using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.AdminModule.AdminRegistration.Queries
{
    public class GetAllAdminsQuery : IRequest<List<USER_DETAIL>> { }

    public class GetAllAdminsQueryHandler
        : IRequestHandler<GetAllAdminsQuery, List<USER_DETAIL>>
    {
        private readonly IApplicationDbContext _context;
        private readonly IAppLogger _logger;

        public GetAllAdminsQueryHandler(
            IApplicationDbContext context,
            IAppLogger logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<USER_DETAIL>> Handle(
            GetAllAdminsQuery request,
            CancellationToken cancellationToken)
        {
            try
            {
                _logger.Info("Fetching all admin users");

                var admins = await _context.USER_DETAIL
                    .Where(x => x.UserRole == UserRole.Admin)
                    .OrderBy(x => x.UserId)
                    .ToListAsync(cancellationToken);

                _logger.Info($"Admin count: {admins.Count}");

                return admins;
            }
            catch (Exception ex)
            {
                _logger.Error("Failed to fetch admin users", ex);
                throw;
            }
        }
    }
}
