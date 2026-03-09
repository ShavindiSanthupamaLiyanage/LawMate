using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace LawMate.Application.LawyerModule.LawyerKnowledgeHub.Command
{
    public record DeleteArticleCommand(int ArticleId) : IRequest<bool>;
    public class DeleteArticleCommandHandler : IRequestHandler<DeleteArticleCommand, bool>
    {
        private readonly IApplicationDbContext _context;

        public DeleteArticleCommandHandler(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<bool> Handle(DeleteArticleCommand request, CancellationToken cancellationToken)
        {
            var article = await _context.ARTICLE
                .FirstOrDefaultAsync(a => a.ArticleId == request.ArticleId, cancellationToken);

            if (article == null)
                throw new Exception($"Article with ID {request.ArticleId} not found.");

            _context.ARTICLE.Remove(article);
            await _context.SaveChangesAsync(cancellationToken);

            return true; // successfully deleted
        }
    }
}