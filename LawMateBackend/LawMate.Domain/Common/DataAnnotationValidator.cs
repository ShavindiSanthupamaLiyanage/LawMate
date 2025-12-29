using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Common
{
    public static class DataAnnotationValidator
    {
        public static bool Validate<T>(T obj, out ICollection<ValidationResult> results)
        {
            results = new List<ValidationResult>();

            return obj != null && Validator.TryValidateObject(obj, new ValidationContext(obj), results, true);
        }
    }
}
