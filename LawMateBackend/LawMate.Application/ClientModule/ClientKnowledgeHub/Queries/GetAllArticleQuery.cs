using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.ClientModule.ClientKnowledgeHub.Queries
{
    public record GetAllArticleQuery : IRequest<List<ArticleDto>>;

    public class GetAllArticleQueryHandler 
        : IRequestHandler<GetAllArticleQuery, List<ArticleDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllArticleQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ArticleDto>> Handle(
            GetAllArticleQuery request,
            CancellationToken cancellationToken)
        {
            return await _context.ARTICLE
                .Where(a => a.IsPublished)   // clients should only see published articles
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
                    LikeCount = a.LikeCount
                   
                })
                .ToListAsync(cancellationToken);
        }
    }
}