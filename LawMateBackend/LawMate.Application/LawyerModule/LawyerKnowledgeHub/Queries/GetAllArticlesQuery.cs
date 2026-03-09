using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries
{
    public record GetAllArticlesQuery : IRequest<List<ArticleDto>>;

    public class GetAllArticlesQueryHandler
        : IRequestHandler<GetAllArticlesQuery, List<ArticleDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetAllArticlesQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ArticleDto>> Handle(
            GetAllArticlesQuery request,
            CancellationToken cancellationToken)
        {
            return await _context.ARTICLE   
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
                    CreatedBy =  a.CreatedBy,
                    CreatedAt = a.CreatedAt,
                    ModifiedBy =   a.ModifiedBy,
                    ModifiedAt = a.ModifiedAt,
                  LikeCount = a.LikeCount,

                    
                })
                .ToListAsync(cancellationToken);
        }
    }
}