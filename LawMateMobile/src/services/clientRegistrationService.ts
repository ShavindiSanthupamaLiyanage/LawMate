import { API_CONFIG, ENDPOINTS } from "../config/api.config";
import { ClientRegistrationDetails } from "../interfaces/clientRegistration.interface";
import { Prefix, Gender, Language } from "../enum/enum";


const PrefixName: Record<number, string> = {
    [Prefix.Rev]: "Rev",
    [Prefix.Dr]:  "Dr",
    [Prefix.Mr]:  "Mr",
    [Prefix.Mrs]: "Mrs",
    [Prefix.Ms]:  "Ms",
};

const GenderName: Record<number, string> = {
    [Gender.Male]:   "Male",
    [Gender.Female]: "Female",
};

const DistrictName: Record<number, string> = {
    0:  "Colombo",
    1:  "Gampaha",
    2:  "Kalutara",
    3:  "Kandy",
    4:  "Matale",
    5:  "NuwaraEliya",
    6:  "Galle",
    7:  "Matara",
    8:  "Hambantota",
    9:  "Jaffna",
    10: "Kilinochchi",
    11: "Mannar",
    12: "Mullaitivu",
    13: "Vavuniya",
    14: "Trincomalee",
    15: "Batticaloa",
    16: "Ampara",
    17: "Kurunegala",
    18: "Puttalam",
    19: "Anuradhapura",
    20: "Polonnaruwa",
    21: "Badulla",
    22: "Monaragala",
    23: "Ratnapura",
    24: "Kegalle",
};

const LanguageName: Record<number, string> = {
    [Language.English]: "English",
    [Language.Sinhala]: "Sinhala",
    [Language.Tamil]:   "Tamil",
};

// ── DTO builder ───────────────────────────────────────────────────────────────

const buildClientDto = (details: ClientRegistrationDetails) => ({
    prefix:            PrefixName[details.prefix]   ?? String(details.prefix),
    firstName:         details.firstName,
    lastName:          details.lastName,
    gender:            GenderName[details.gender]   ?? String(details.gender),
    address:           details.address,
    district:          DistrictName[details.district] ?? String(details.district),
    nic:               details.nic,
    contactNumber:     details.mobileContact,
    preferredLanguage: LanguageName[details.language] ?? String(details.language),
    email:             details.email,
    password:          details.password,
    profileImage:      details.profilePic ?? null,
});

// ── service ───────────────────────────────────────────────────────────────────

export const registerClient = async (
    details: ClientRegistrationDetails
): Promise<string> => {
    console.log("=== [registerClient] START ===");
    console.log("[registerClient] Raw form data:", JSON.stringify({
        ...details,
        password:        "***HIDDEN***",
        confirmPassword: "***HIDDEN***",
    }, null, 2));

    const dto = buildClientDto(details);

    console.log("[registerClient] Built DTO:", JSON.stringify({
        ...dto,
        password: "***HIDDEN***",
    }, null, 2));

    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.CLIENT.REGISTER}`;
    console.log("[registerClient] POST →", url);

    let response: Response;
    try {
        response = await fetch(url, {
            method:  "POST",
            headers: API_CONFIG.HEADERS,
            body:    JSON.stringify(dto),
        });
    } catch (networkError) {
        console.error("[registerClient] Network error:", networkError);
        throw new Error("Network error. Please check your connection and try again.");
    }

    console.log("[registerClient] Response status:", response.status);

    const rawText = await response.text();
    console.log("[registerClient] Raw response body:", rawText);

    if (!rawText || rawText.trim() === "") {
        throw new Error(`Server returned an empty response (HTTP ${response.status})`);
    }

    let json: any;
    try {
        json = JSON.parse(rawText);
        console.log("[registerClient] Parsed JSON:", JSON.stringify(json, null, 2));
    } catch {
        throw new Error(`Unexpected server response (HTTP ${response.status}): ${rawText.slice(0, 200)}`);
    }

    if (!response.ok) {
        const validationErrors = json?.errors
            ? Object.values(json.errors).flat().join(" ")
            : null;
        const errorMsg = validationErrors
            ?? json?.error ?? json?.message ?? json?.Message
            ?? `Registration failed (HTTP ${response.status}).`;
        console.error("[registerClient] Registration failed:", errorMsg);
        throw new Error(errorMsg);
    }

    console.log("[registerClient] Registration successful! ClientId:", json.clientId);
    return json.clientId as string;
};