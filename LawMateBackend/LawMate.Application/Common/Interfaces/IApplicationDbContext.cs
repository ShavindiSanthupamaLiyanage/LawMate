using LawMate.Domain.Entities.Auth;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Entities.Lawyer;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace LawMate.Application.Common.Interfaces
{
    public interface IApplicationDbContext
    {
        #region Auth
        DbSet<USER_DETAIL> USER_DETAIL { get; }
        DbSet<CLIENT_DETAILS> CLIENT_DETAILS { get; }
        DbSet<LAWYER_DETAILS> LAWYER_DETAILS { get; }
        DbSet<BOOKING> BOOKING { get; }
        DbSet<BOOKING_PAYMENT> BOOKING_PAYMENT { get; }
        DbSet<CONSULTATION> CONSULTATION { get; }
        DbSet<TIMESLOT> TIMESLOT { get; }
        DbSet<ARTICLE> ARTICLE { get; }
        DbSet<MEMBERSHIP_PAYMENT> MEMBERSHIP_PAYMENT { get; }
        #endregion

        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
        EntityState GetState<T>(T entity) where T : class;
        DatabaseFacade Database { get; }
    }
}
