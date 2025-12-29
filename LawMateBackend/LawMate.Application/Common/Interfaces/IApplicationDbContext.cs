using LawMate.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        #region Auth
        DbSet<USER_DETAIL> USER_DETAIL { get; }

        #endregion

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
        EntityState GetState<T>(T entity) where T : class;
    }
}
