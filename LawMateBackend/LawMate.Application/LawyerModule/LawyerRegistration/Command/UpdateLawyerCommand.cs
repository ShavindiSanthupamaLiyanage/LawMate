using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Command
{
    public class UpdateLawyerCommand
        : IRequest<(USER_DETAIL User, LAWYER_DETAILS Lawyer)>
    {
        public GetLawyerDto Data { get; set; }
    }

    public class UpdateLawyerCommandHandler
        : IRequestHandler<UpdateLawyerCommand, (USER_DETAIL User, LAWYER_DETAILS Lawyer)>
    {
        private readonly IApplicationDbContext _context;

        public UpdateLawyerCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(USER_DETAIL User, LAWYER_DETAILS Lawyer)> Handle(
            UpdateLawyerCommand request,
            CancellationToken cancellationToken)
        {
            var dto = request.Data
                ?? throw new ArgumentNullException(nameof(request.Data));

            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(x => x.UserId == dto.UserId, cancellationToken);

            var lawyer = await _context.LAWYER_DETAILS
                .FirstOrDefaultAsync(x => x.UserId == dto.UserId, cancellationToken);

            if (user == null || lawyer == null)
                throw new KeyNotFoundException("Lawyer not found");

            // USER_DETAIL updates
            user.ContactNumber = dto.ContactNumber ?? user.ContactNumber;

            // LAWYER_DETAILS updates
            lawyer.Bio = dto.Bio;
            lawyer.YearOfExperience = dto.YearOfExperience;
            lawyer.WorkingDistrict = dto.WorkingDistrict;
            lawyer.AreaOfPractice = dto.AreaOfPractice;
            lawyer.OfficeContactNumber = dto.OfficeContactNumber;

            await _context.SaveChangesAsync(cancellationToken);

            return (user, lawyer);
        }
    }
}
