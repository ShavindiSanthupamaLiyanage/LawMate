using LawMate.Domain.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Entities.Common
{
    public abstract class BaseEntity : ValidationBase
    {
        [Key]
        public int Id { get; set; }
    }
}
