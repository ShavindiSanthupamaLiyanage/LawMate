using LawMate.Application.Common.Interfaces;
using LawMate.Domain.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

using LawMate.Domain.Common.Enums;

namespace LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command
{
    public record UpdateArticleCommand(int ArticleId, UpdateArticleDto Article) : IRequest<UpdateArticleDto>;
    public class UpdateArticleCommandHandler : IRequestHandler<UpdateArticleCommand, UpdateArticleDto>
    {
        private readonly IApplicationDbContext _context;

        public UpdateArticleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<UpdateArticleDto> Handle(UpdateArticleCommand request, CancellationToken cancellationToken)
        {
            var article = await _context.ARTICLE
                .FirstOrDefaultAsync(a => a.ArticleId == request.ArticleId, cancellationToken);

            if (article == null)
                throw new Exception($"Article with ID {request.ArticleId} not found.");

            // Update fields
            article.Title = request.Article.Title;
            article.Content = request.Article.Content;
            // article.LegalCategory = Enum.Parse<LegalCategory>(request.Article.LegalCategory);
            // article.Language = Enum.Parse<Language>(request.Article.Language);
            article.IsPublished = request.Article.IsPublished;
            article.ModifiedBy = request.Article.ModifiedBy;
            article.ModifiedAt = DateTime.UtcNow;
           article.LikeCount = request.Article.LikeCount;

            await _context.SaveChangesAsync(cancellationToken);

            // Return updated DTO
            request.Article.ArticleId = article.ArticleId;
            request.Article.CreatedAt = article.CreatedAt;
            request.Article.ModifiedAt = article.ModifiedAt;

            return request.Article;
        }
    }
}