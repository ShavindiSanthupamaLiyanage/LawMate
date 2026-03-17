using LawMate.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LawMate.Application.LawyerModule.LawyerEvent.Commands;

public class DeleteLawyerEventCommand : IRequest<bool>
{
    public int EventId { get; set; }
}

public class DeleteLawyerEventCommandHandler
    : IRequestHandler<DeleteLawyerEventCommand, bool>
{
    private readonly IApplicationDbContext _context;
    private readonly IAppLogger _logger;

    public DeleteLawyerEventCommandHandler(
        IApplicationDbContext context,
        IAppLogger logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> Handle(
        DeleteLawyerEventCommand request,
        CancellationToken cancellationToken)
    {
        _logger.Info($"DeleteLawyerEventCommand started for EventId: {request.EventId}");

        var lawyerEvent = await _context.LAWYER_EVENT
            .FirstOrDefaultAsync(e => e.EventId == request.EventId, cancellationToken);

        if (lawyerEvent == null)
        {
            _logger.Warning($"Lawyer event not found: {request.EventId}");
            throw new KeyNotFoundException($"Lawyer event with ID {request.EventId} not found");
        }

        _context.LAWYER_EVENT.Remove(lawyerEvent);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.Info($"Lawyer event deleted | EventId: {request.EventId}");

        return true;
    }
}
