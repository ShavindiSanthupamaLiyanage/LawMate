/**
 * enums.ts
 *
 * Single source of truth for all enums — mirrors the C# backend enums in
 * LawMate.Domain.Common.Enums exactly (same names, same integer values).
 *
 * Import from here anywhere you need enum values or labels.
 */

export enum UserRole {
    Admin  = 0,
    Lawyer = 1,
    Client = 2,
}

export enum State {
    Pending  = 0,
    Active   = 1,
    Inactive = 2,
}

export enum VerificationStatus {
    Pending  = 0,
    Verified = 1,
    Rejected = 2,
}

export enum BookingStatus {
    Pending   = 0,
    Accepted  = 1,
    Verified  = 2,
    Rejected  = 3,
    Suspended = 4,
}

export enum LegalCategory {
    All         = 0,
    FamilyLaw   = 1,
    CriminalLaw = 2,
    PropertyLaw = 3,
}

export enum Language {
    English = 1,
    Sinhala = 2,
    Tamil   = 3,
}

export enum Prefix {
    Rev = 1,
    Dr  = 2,
    Mr  = 3,
    Mrs = 4,
    Ms  = 5,
}

export enum Gender {
    Male   = 1,
    Female = 2,
}

export enum Province {
    Western      = 0,
    Central      = 1,
    Southern     = 2,
    Northern     = 3,
    Eastern      = 4,
    NorthWestern = 5,
    NorthCentral = 6,
    Uva          = 7,
    Sabaragamuwa = 8,
}

export enum District {
    Colombo      = 0,
    Gampaha      = 1,
    Kalutara     = 2,
    Kandy        = 3,
    Matale       = 4,
    NuwaraEliya  = 5,
    Galle        = 6,
    Matara       = 7,
    Hambantota   = 8,
    Jaffna       = 9,
    Kilinochchi  = 10,
    Mannar       = 11,
    Mullaitivu   = 12,
    Vavuniya     = 13,
    Trincomalee  = 14,
    Batticaloa   = 15,
    Ampara       = 16,
    Kurunegala   = 17,
    Puttalam     = 18,
    Anuradhapura = 19,
    Polonnaruwa  = 20,
    Badulla      = 21,
    Monaragala   = 22,
    Ratnapura    = 23,
    Kegalle      = 24,
}

export enum AreaOfPractice {
    Civil      = 0,
    Criminal   = 1,
    Labour     = 2,
    Commercial = 3,
}

export enum PaymentStatus {
    Pending  = 0,
    Paid     = 1,
    Refunded = 2,
    Failed   = 3,
}

export enum ConsultationStatus {
    Scheduled  = 0,
    InProgress = 1,
    Completed  = 2,
    Cancelled  = 3,
    NoShow     = 4,
}