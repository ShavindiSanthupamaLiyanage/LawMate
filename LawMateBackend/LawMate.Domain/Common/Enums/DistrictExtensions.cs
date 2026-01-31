using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Common.Enums
{
    public static class DistrictExtensions
    {
        private static readonly Dictionary<District, Province> DistrictProvinceMap =
            new()
            {
            { District.Colombo, Province.Western },
            { District.Gampaha, Province.Western },
            { District.Kalutara, Province.Western },

            { District.Kandy, Province.Central },
            { District.Matale, Province.Central },
            { District.NuwaraEliya, Province.Central },

            { District.Galle, Province.Southern },
            { District.Matara, Province.Southern },
            { District.Hambantota, Province.Southern },

            { District.Jaffna, Province.Northern },
            { District.Kilinochchi, Province.Northern },
            { District.Mannar, Province.Northern },
            { District.Mullaitivu, Province.Northern },
            { District.Vavuniya, Province.Northern },

            { District.Trincomalee, Province.Eastern },
            { District.Batticaloa, Province.Eastern },
            { District.Ampara, Province.Eastern },

            { District.Kurunegala, Province.NorthWestern },
            { District.Puttalam, Province.NorthWestern },

            { District.Anuradhapura, Province.NorthCentral },
            { District.Polonnaruwa, Province.NorthCentral },

            { District.Badulla, Province.Uva },
            { District.Monaragala, Province.Uva },

            { District.Ratnapura, Province.Sabaragamuwa },
            { District.Kegalle, Province.Sabaragamuwa }
            };

        public static Province GetProvince(this District district)
            => DistrictProvinceMap[district];

        //public record District(string Name, Province Province); -- usage

    }
}
