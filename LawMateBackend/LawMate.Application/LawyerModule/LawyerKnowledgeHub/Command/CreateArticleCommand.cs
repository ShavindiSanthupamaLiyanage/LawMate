using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Lawyer;
using LawMate.Domain.DTOs;
using MediatR;
using LawMate.Domain.Common.Enums;

namespace LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command
{
    public record CreateArticleCommand(ArticleDto Article) : IRequest<ArticleDto>;

    public class CreateArticleCommandHandler : IRequestHandler<CreateArticleCommand, ArticleDto>
    {
        private readonly IApplicationDbContext _context;

        public CreateArticleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<ArticleDto> Handle(CreateArticleCommand request, CancellationToken cancellationToken)
        {
            var article = new ARTICLE
            {
                LawyerId = request.Article.LawyerId,
                Title = request.Article.Title,
                Content = request.Article.Content,
                LegalCategory = Enum.Parse<LegalCategory>(request.Article.LegalCategory),
                Language = Enum.Parse<Language>(request.Article.Language),
                IsPublished = request.Article.IsPublished,
                CreatedBy = request.Article.CreatedBy,
                CreatedAt = DateTime.UtcNow,
                LikeCount = request.Article.LikeCount,
            };

            _context.ARTICLE.Add(article);
            await _context.SaveChangesAsync(cancellationToken);

            request.Article.ArticleId = article.ArticleId;
            request.Article.CreatedAt = article.CreatedAt;

            return request.Article;
        }
    }
}