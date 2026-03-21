    using LawMate.Application.Common.Interfaces;
    using LawMate.Domain.Entities.Lawyer;
    using LawMate.Domain.DTOs;
    using MediatR;

    namespace LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command
    {
        public record CreateArticleCommand(CreateArticleDto Article, string LawyerId, string LawyerName) : IRequest<ArticleDto>;

        public class CreateArticleCommandHandler : IRequestHandler<CreateArticleCommand, ArticleDto>
        {
            private readonly IApplicationDbContext _context;

            public CreateArticleCommandHandler(IApplicationDbContext context)
            {
                _context = context;
            }

            public async Task<ArticleDto> Handle(CreateArticleCommand request, CancellationToken cancellationToken)
            {
                var dto = request.Article;

                if (string.IsNullOrWhiteSpace(dto.Title))
                    throw new ArgumentException("Article title is required.");

                if (string.IsNullOrWhiteSpace(dto.Content))
                    throw new ArgumentException("Article content is required.");

                var article = new ARTICLE()
                {
                    Title = dto.Title,
                    Content = dto.Content,
                    LawyerId = request.LawyerId,
                    CreatedBy = request.LawyerName,
                    CreatedAt = DateTime.UtcNow,
                    IsPublished = true,
                    LikeCount = 0
                };

                _context.ARTICLE.Add(article);
                await _context.SaveChangesAsync(cancellationToken);

                return new ArticleDto
                {
                    ArticleId = article.ArticleId,
                    Title = article.Title,
                    Content = article.Content,
                    LawyerId = article.LawyerId,
                    CreatedBy = article.CreatedBy,
                    CreatedAt = article.CreatedAt,
                    IsPublished = article.IsPublished,
                    LikeCount = article.LikeCount
                };
            }
        }
    }