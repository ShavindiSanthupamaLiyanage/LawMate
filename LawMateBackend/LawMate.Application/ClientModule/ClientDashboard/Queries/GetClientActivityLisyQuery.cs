using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientDashboard.Queries
{
    public record GetClientActivityListQuery(string ClientId) : IRequest<List<ClientActivityDto>>;

    public class GetClientActivityListQueryHandler
        : IRequestHandler<GetClientActivityListQuery, List<ClientActivityDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetClientActivityListQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ClientActivityDto>> Handle(
            GetClientActivityListQuery request,
            CancellationToken cancellationToken)
        {
            var activities = await (
                from b in _context.BOOKING
                join l in _context.LAWYER_DETAILS on b.LawyerId equals l.UserId
                join u in _context.USER_DETAIL on l.UserId equals u.UserId
                where b.ClientId == request.ClientId && u.RecordStatus == 0
                orderby (b.CreatedAt ?? b.ScheduledDateTime) descending
                select new ClientActivityDto
                {
                    BookingId = b.BookingId,
                    Title = string.IsNullOrWhiteSpace(b.IssueDescription)
                        ? "Untitled Issue"
                        : b.IssueDescription,
                    CaseNumber = $"LC{DateTime.Now.Year}-{b.BookingId:D3}",
                    LawyerName = ((u.FirstName ?? "") + " " + (u.LastName ?? "")).Trim(),
                    LawyerDetails = !string.IsNullOrWhiteSpace(l.ProfessionalDesignation)
                        ? l.ProfessionalDesignation
                        : (l.Bio ?? string.Empty),
                    LawyerImage = u.ProfileImage,
                    Status = b.BookingStatus.ToString(),
                    FiledDate = b.CreatedAt ?? b.ScheduledDateTime
                }
            ).ToListAsync(cancellationToken);

            return activities;
        }
    }
}