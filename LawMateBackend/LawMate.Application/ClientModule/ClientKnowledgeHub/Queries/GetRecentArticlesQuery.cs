using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientKnowledgeHub.Queries
{
    public record GetRecentArticlesQuery : IRequest<List<ArticleDto>>;

    public class GetRecentArticlesQueryHandler 
        : IRequestHandler<GetRecentArticlesQuery, List<ArticleDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetRecentArticlesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ArticleDto>> Handle(
            GetRecentArticlesQuery request,
            CancellationToken cancellationToken)
        {
            var lastWeek = DateTime.UtcNow.AddDays(-7);

            return await _context.ARTICLE
                .Where(a => a.IsPublished && a.CreatedAt >= lastWeek)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new ArticleDto
                {
                    ArticleId = a.ArticleId,
                    LawyerId = a.LawyerId,
                    Title = a.Title,
                    Content = a.Content,
                    LegalCategory = a.LegalCategory.ToString(),
                    Language = a.Language.ToString(),
                    IsPublished = a.IsPublished,
                    CreatedBy = a.CreatedBy,
                    CreatedAt = a.CreatedAt,
                    ModifiedBy = a.ModifiedBy,
                    ModifiedAt = a.ModifiedAt,
                   

                })
                .ToListAsync(cancellationToken);
        }
    }
}