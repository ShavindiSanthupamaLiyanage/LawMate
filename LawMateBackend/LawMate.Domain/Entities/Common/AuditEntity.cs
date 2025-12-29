using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Entities.Common
{
    public class AuditEntity : BaseEntity
    {
        [MaxLength(150)]
        public string? CreatedBy { get; set; }
        public DateTime? CreatedAt { get; set; }

        [MaxLength(150)]
        public string? ModifiedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
    }
}
