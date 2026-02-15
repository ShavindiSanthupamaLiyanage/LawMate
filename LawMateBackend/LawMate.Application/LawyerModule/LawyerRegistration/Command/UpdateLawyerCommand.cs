using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Common.Enums;
using LawMate.Domain.DTOs;
using LawMate.Domain.Entities.Auth;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerRegistration.Command
{
    public class UpdateLawyerCommand 
        : IRequest<(USER_DETAIL User, LAWYER_DETAILS Lawyer)>
    {
        public string UserId { get; set; }

        // USER_DETAIL
        public string? ContactNumber { get; set; }

        // LAWYER_DETAILS
        public string? Bio { get; set; }
        public int YearOfExperience { get; set; }
        public District WorkingDistrict { get; set; }
        public AreaOfPractice AreaOfPractice { get; set; }
        public string? OfficeContactNumber { get; set; }
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
            var user = await _context.USER_DETAIL
                .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

            var lawyer = await _context.LAWYER_DETAILS
                .FirstOrDefaultAsync(x => x.UserId == request.UserId, cancellationToken);

            if (user == null || lawyer == null)
                throw new KeyNotFoundException("Lawyer not found");

            // USER_DETAIL updates
            user.ContactNumber = request.ContactNumber ?? user.ContactNumber;

            // LAWYER_DETAILS updates
            lawyer.Bio = request.Bio;
            lawyer.YearOfExperience = request.YearOfExperience;
            lawyer.WorkingDistrict = request.WorkingDistrict;
            lawyer.AreaOfPractice = request.AreaOfPractice;
            lawyer.OfficeContactNumber = request.OfficeContactNumber;

            await _context.SaveChangesAsync(cancellationToken);

            return (user, lawyer);
        }
    }
}
