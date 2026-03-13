using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace LawMate.Application.LawyerModule.LawyerKnowledgeHub.Queries
{
    public record GetArticlesByLawyerQuery(string LawyerId) : IRequest<List<ArticleDto>>;

    public class GetArticlesByLawyerQueryHandler
        : IRequestHandler<GetArticlesByLawyerQuery, List<ArticleDto>>
    {
        private readonly IApplicationDbContext _context;

        public GetArticlesByLawyerQueryHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ArticleDto>> Handle(
            GetArticlesByLawyerQuery request,
            CancellationToken cancellationToken)
        {
            return await _context.ARTICLE
                .Where(a => a.LawyerId == request.LawyerId) // now both are string
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
                LikeCount =  a.LikeCount,

                })
                .ToListAsync(cancellationToken);
        }
    }
}