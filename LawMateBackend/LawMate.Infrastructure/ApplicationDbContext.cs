using LawMate.Application.Common.Interfaces;
using LawMate.Domain.Entities.Auth;
using LawMate.Domain.Entities.Booking;
using LawMate.Domain.Entities.Lawyer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace LawMate.Infrastructure
{
    public class ApplicationDbContext : DbContext, IApplicationDbContext
    {

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        #region Auth
        public DbSet<USER_DETAIL> USER_DETAIL => Set<USER_DETAIL>();
        public DbSet<CLIENT_DETAILS> CLIENT_DETAILS => Set<CLIENT_DETAILS>();
        public DbSet<LAWYER_DETAILS> LAWYER_DETAILS => Set<LAWYER_DETAILS>();
        public DbSet<BOOKING> BOOKING => Set<BOOKING>(); 
        public DbSet<BOOKING_PAYMENT> BOOKING_PAYMENT => Set<BOOKING_PAYMENT>(); 
        public DbSet<CONSULTATION> CONSULTATION => Set<CONSULTATION>(); 
        public DbSet<TIMESLOT> TIMESLOT => Set<TIMESLOT>(); 
        public DbSet<ARTICLE> ARTICLE => Set<ARTICLE>(); 
        public DbSet<MEMBERSHIP_PAYMENT> MEMBERSHIP_PAYMENT => Set<MEMBERSHIP_PAYMENT>(); 

        #endregion

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<USER_DETAIL>(b =>
            {
                b.HasKey(x => x.Id);

                b.Property(x => x.UserId)
                 .HasMaxLength(20)
                 .HasComputedColumnSql(
                    "CASE " +
                    "WHEN [UserRole] = 0 THEN 'ADM' " +
                    "WHEN [UserRole] = 1 THEN 'LAW' " +
                    "WHEN [UserRole] = 2 THEN 'CIT' " +
                    "END + " +
                    "RIGHT('000' + CAST([Id] AS VARCHAR(10)), 3)",
                    stored: true);

                //b.HasIndex(x => x.UserId).IsUnique();
            });
            
            modelBuilder.Entity<BOOKING_PAYMENT>(b =>
            {
                b.Property(x => x.Amount)
                    .HasPrecision(18, 2);
            });

            modelBuilder.Entity<MEMBERSHIP_PAYMENT>(b =>
            {
                b.Property(x => x.Amount)
                    .HasPrecision(18, 2);
            });

        }

        public DatabaseFacade Database => base.Database;
        
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await base.SaveChangesAsync(cancellationToken);
        }

        public EntityState GetState<T>(T entity) where T : class
        {
            return Entry(entity).State;
        }
    }
}
