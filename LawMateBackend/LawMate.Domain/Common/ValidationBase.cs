using LawMate.Domain.Extentions;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Throw;

namespace LawMate.Domain.Common
{
    public class ValidationBase
    {
        public void ValidateModel()
        {
            ICollection<ValidationResult> results;
            var valid = DataAnnotationValidator.Validate(this, out results);
            if (!valid)
                Console.WriteLine(results.Select(o => o.ErrorMessage).ToJson());

            valid.Throw($"Validation error occured : {results.Select(o => o.ErrorMessage).ToJson()}").IfFalse();
        }
    }
}
