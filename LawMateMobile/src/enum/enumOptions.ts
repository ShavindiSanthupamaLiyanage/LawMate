/**
 * enumOptions.ts
 *
 * Ready-to-use { label, value } arrays for every enum that appears in a
 * dropdown / SelectInput.  All values are the integer codes the backend expects.
 *
 * Usage:
 *   import { PrefixOptions, GenderOptions, DistrictOptions } from "./enumOptions";
 *   <SelectInput items={PrefixOptions} ... />
 */

import {
    Prefix,
    Gender,
    District,
    AreaOfPractice,
    LegalCategory,
    Language,
    Province,
} from "./enum";

export type SelectOption = { label: string; value: number };

// ── Prefix ───────────────────────────────────────────────────────────────────
export const PrefixOptions: SelectOption[] = [
    { label: "Rev.", value: Prefix.Rev },
    { label: "Dr.",  value: Prefix.Dr  },
    { label: "Mr.",  value: Prefix.Mr  },
    { label: "Mrs.", value: Prefix.Mrs },
    { label: "Ms.",  value: Prefix.Ms  },
];

// ── Gender ───────────────────────────────────────────────────────────────────
export const GenderOptions: SelectOption[] = [
    { label: "Male",   value: Gender.Male   },
    { label: "Female", value: Gender.Female },
];

// ── District ─────────────────────────────────────────────────────────────────
export const DistrictOptions: SelectOption[] = [
    { label: "Colombo",       value: District.Colombo      },
    { label: "Gampaha",       value: District.Gampaha      },
    { label: "Kalutara",      value: District.Kalutara     },
    { label: "Kandy",         value: District.Kandy        },
    { label: "Matale",        value: District.Matale       },
    { label: "Nuwara Eliya",  value: District.NuwaraEliya  },
    { label: "Galle",         value: District.Galle        },
    { label: "Matara",        value: District.Matara       },
    { label: "Hambantota",    value: District.Hambantota   },
    { label: "Jaffna",        value: District.Jaffna       },
    { label: "Kilinochchi",   value: District.Kilinochchi  },
    { label: "Mannar",        value: District.Mannar       },
    { label: "Mullaitivu",    value: District.Mullaitivu   },
    { label: "Vavuniya",      value: District.Vavuniya     },
    { label: "Trincomalee",   value: District.Trincomalee  },
    { label: "Batticaloa",    value: District.Batticaloa   },
    { label: "Ampara",        value: District.Ampara       },
    { label: "Kurunegala",    value: District.Kurunegala   },
    { label: "Puttalam",      value: District.Puttalam     },
    { label: "Anuradhapura",  value: District.Anuradhapura },
    { label: "Polonnaruwa",   value: District.Polonnaruwa  },
    { label: "Badulla",       value: District.Badulla      },
    { label: "Monaragala",    value: District.Monaragala   },
    { label: "Ratnapura",     value: District.Ratnapura    },
    { label: "Kegalle",       value: District.Kegalle      },
];

// ── Area of Practice ─────────────────────────────────────────────────────────
export const AreaOfPracticeOptions: SelectOption[] = [
    { label: "Civil",      value: AreaOfPractice.Civil      },
    { label: "Criminal",   value: AreaOfPractice.Criminal   },
    { label: "Labour",     value: AreaOfPractice.Labour     },
    { label: "Commercial", value: AreaOfPractice.Commercial },
];
export const AreaOfPracticeLabels: Record<string, string> = {
    Criminal: 'Criminal Law',
    Civil: 'Civil Law / Civil Disputes',
    Family: 'Family Law',
    Corporate: 'Business / Commercial Law',
    'Intellectual Property': 'Intellectual Property Law',
    Labour: 'Employment Law',
    'Land & Property': 'Property Law',
};

// ── Legal Category (used in search / filters) ────────────────────────────────
export const LegalCategoryOptions: SelectOption[] = [
    { label: "All",          value: LegalCategory.All         },
    { label: "Family Law",   value: LegalCategory.FamilyLaw   },
    { label: "Criminal Law", value: LegalCategory.CriminalLaw },
    { label: "Property Law", value: LegalCategory.PropertyLaw },
];

// ── Language ─────────────────────────────────────────────────────────────────
export const LanguageOptions: SelectOption[] = [
    { label: "English", value: Language.English },
    { label: "Sinhala", value: Language.Sinhala },
    { label: "Tamil",   value: Language.Tamil   },
];

// ── Province (read-only display, rarely a form field) ────────────────────────
export const ProvinceOptions: SelectOption[] = [
    { label: "Western",       value: Province.Western      },
    { label: "Central",       value: Province.Central      },
    { label: "Southern",      value: Province.Southern     },
    { label: "Northern",      value: Province.Northern     },
    { label: "Eastern",       value: Province.Eastern      },
    { label: "North Western", value: Province.NorthWestern },
    { label: "North Central", value: Province.NorthCentral },
    { label: "Uva",           value: Province.Uva          },
    { label: "Sabaragamuwa",  value: Province.Sabaragamuwa },
];

export const DistrictsByProvince: Record<Province, SelectOption[]> = {
    [Province.Western]:      [
        { label: "Colombo",      value: District.Colombo      },
        { label: "Gampaha",      value: District.Gampaha      },
        { label: "Kalutara",     value: District.Kalutara     },
    ],
    [Province.Central]:      [
        { label: "Kandy",        value: District.Kandy        },
        { label: "Matale",       value: District.Matale       },
        { label: "Nuwara Eliya", value: District.NuwaraEliya  },
    ],
    [Province.Southern]:     [
        { label: "Galle",        value: District.Galle        },
        { label: "Matara",       value: District.Matara       },
        { label: "Hambantota",   value: District.Hambantota   },
    ],
    [Province.Northern]:     [
        { label: "Jaffna",       value: District.Jaffna       },
        { label: "Kilinochchi",  value: District.Kilinochchi  },
        { label: "Mannar",       value: District.Mannar       },
        { label: "Mullaitivu",   value: District.Mullaitivu   },
        { label: "Vavuniya",     value: District.Vavuniya     },
    ],
    [Province.Eastern]:      [
        { label: "Trincomalee",  value: District.Trincomalee  },
        { label: "Batticaloa",   value: District.Batticaloa   },
        { label: "Ampara",       value: District.Ampara       },
    ],
    [Province.NorthWestern]: [
        { label: "Kurunegala",   value: District.Kurunegala   },
        { label: "Puttalam",     value: District.Puttalam     },
    ],
    [Province.NorthCentral]: [
        { label: "Anuradhapura", value: District.Anuradhapura },
        { label: "Polonnaruwa",  value: District.Polonnaruwa  },
    ],
    [Province.Uva]:          [
        { label: "Badulla",      value: District.Badulla      },
        { label: "Monaragala",   value: District.Monaragala   },
    ],
    [Province.Sabaragamuwa]: [
        { label: "Ratnapura",    value: District.Ratnapura    },
        { label: "Kegalle",      value: District.Kegalle      },
    ],
};