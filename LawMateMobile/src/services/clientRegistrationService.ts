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

const appendFile = (
    form: FormData,
    field: string,
    asset: { uri: string; name: string; mimeType?: string } | null | undefined
) => {
    if (!asset) return;
    form.append(field, {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
    } as unknown as Blob);
};

export const registerClient = async (
    details: ClientRegistrationDetails
): Promise<string> => {
    console.log("=== [registerClient] START ===");

    const data = new FormData();
    data.append('Prefix',            PrefixName[details.prefix]    ?? String(details.prefix));
    data.append('FirstName',         details.firstName);
    data.append('LastName',          details.lastName);
    data.append('Gender',            GenderName[details.gender]    ?? String(details.gender));
    data.append('Address',           details.address);
    data.append('District',          DistrictName[details.district] ?? String(details.district));
    data.append('NIC',               details.nic);
    data.append('ContactNumber',     details.mobileContact);
    data.append('PreferredLanguage', LanguageName[details.language] ?? String(details.language));
    data.append('Email',             details.email);
    data.append('Password',          details.password);

    if (details.profilePic) {
        appendFile(data, 'ProfileImage', details.profilePic);
    }

    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.CLIENT.REGISTER}`;
    console.log("[registerClient] POST →", url);

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            body:   data,
            // NO Content-Type header — fetch sets multipart/form-data + boundary automatically
        });
    } catch (networkError) {
        throw new Error("Network error. Please check your connection and try again.");
    }

    console.log("[registerClient] Response status:", response.status);
    const rawText = await response.text();
    console.log("[registerClient] Raw response:", rawText);

    if (!rawText?.trim()) throw new Error(`Empty response (HTTP ${response.status})`);

    let json: any;
    try { json = JSON.parse(rawText); } catch {
        throw new Error(`Unexpected response (HTTP ${response.status}): ${rawText.slice(0, 200)}`);
    }

    if (!response.ok) {
        const msg = json?.errors
            ? Object.values(json.errors).flat().join(' ')
            : json?.error ?? json?.message ?? json?.Message ?? `Registration failed (HTTP ${response.status})`;
        throw new Error(msg);
    }

    console.log("[registerClient] Success! ClientId:", json.clientId);
    return json.clientId as string;
};