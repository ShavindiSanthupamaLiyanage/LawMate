using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LawMate.Domain.Common.Enums
{
    public enum UserRole
    {
        Admin = 0,
        Lawyer = 1,
        Clinet = 2
    }

    public enum State
    {
        Pendig = 0,
        Active = 1,
        Inactive = 2,
    }

    public enum VerificationStatus
    {
        Pending = 0,
        Verified = 1,
        Rejected = 2
    }

    public enum BookingStatus
    {
        Pending = 0,
        Accepted = 1,
        Verified = 2,
        Rejected = 3,
        Suspended = 4, 
    }

    public enum LegalCategory
    {
        All = 0,
        FamilyLaw = 1,
        CriminalLaw = 2,
        PropertyLaw = 3,
    }

    public enum Language
    {
        English = 1,
        Sinhala = 2,
        Tamil = 3
    }

    public enum Prefix
    { 
        Rev = 1,
        Dr = 2,
        Mr = 3,
        Mrs = 4,
        Ms = 5
    }

    public enum Gender
    {
        Male = 1,
        Female = 2,
    }

    public enum Province
    {
        Western,
        Central,
        Southern,
        Northern,
        Eastern,
        NorthWestern,
        NorthCentral,
        Uva,
        Sabaragamuwa
    }

    public enum District
    {
        Colombo,
        Gampaha,
        Kalutara,

        Kandy,
        Matale,
        NuwaraEliya,

        Galle,
        Matara,
        Hambantota,

        Jaffna,
        Kilinochchi,
        Mannar,
        Mullaitivu,
        Vavuniya,

        Trincomalee,
        Batticaloa,
        Ampara,

        Kurunegala,
        Puttalam,

        Anuradhapura,
        Polonnaruwa,

        Badulla,
        Monaragala,

        Ratnapura,
        Kegalle
    }

    public enum AreaOfPractice
    { 
        Civil,
        Criminal,
        Labour,
        Commercial
    }
}
