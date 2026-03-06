import { API_CONFIG, ENDPOINTS } from "../config/api.config";
import {
    CreateLawyerResponse,
    LawyerRegistrationForm,
} from "../interfaces/lawyerRegistration.interface";
import {
    UserRole,
    State,
    VerificationStatus,
} from "../emun/enum";


const appendFile = (
    form: FormData,
    field: string,
    asset: { uri: string; name: string; mimeType?: string } | null | undefined
) => {
    if (!asset) return;
    form.append(field, {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "application/octet-stream",
    } as unknown as Blob);
};

export const registerLawyer = async (
    form: LawyerRegistrationForm
): Promise<CreateLawyerResponse> => {
    console.log("=== [registerLawyer] START ===");
    console.log("[registerLawyer] Raw form data:", JSON.stringify({
        ...form,
        password: "***HIDDEN***",
        confirmPassword: "***HIDDEN***",
        profileImage:          form.profileImage          ? { name: form.profileImage.name }          : null,
        enrollmentCertificate: form.enrollmentCertificate ? { name: form.enrollmentCertificate.name } : null,
        nicFrontImage:         form.nicFrontImage         ? { name: form.nicFrontImage.name }         : null,
        nicBackImage:          form.nicBackImage          ? { name: form.nicBackImage.name }          : null,
    }, null, 2));

    // ── Validation ──────────────────────────────────────────────────────────
    if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
    }
    if (!form.confirmed) {
        throw new Error("Please confirm that the details are accurate.");
    }

    console.log("[registerLawyer] Validation passed");
    // form.prefix, form.gender, form.areaOfPractice, form.workingDistrict
    // are already integer enum values because SelectInput now uses enumOptions.ts
    console.log("[registerLawyer] Enum values →", {
        Prefix:          form.prefix,
        Gender:          form.gender,
        AreaOfPractice:  form.areaOfPractice,
        WorkingDistrict: form.workingDistrict,
    });

    // ── Build FormData ───────────────────────────────────────────────────────
    const data = new FormData();

    // Identity / auth
    data.append("Prefix",        String(form.prefix));
    data.append("FirstName",     form.firstName);
    data.append("LastName",      form.lastName);
    data.append("Email",         form.email);
    data.append("Password",      form.password);
    data.append("NIC",           form.nic);
    data.append("ContactNumber", form.mobileContact);
    data.append("Gender",        String(form.gender));

    if (form.dob) {
        data.append("DateOfBirth", form.dob.toISOString());
        console.log("[registerLawyer] DateOfBirth:", form.dob.toISOString());
    } else {
        console.warn("[registerLawyer] DateOfBirth is null — field will be omitted");
    }

    // Professional
    data.append("SCECertificateNo",         form.sceCertificateNo);
    data.append("Bio",                      form.designation);
    data.append("ProfessionalDesignation",  form.designation);
    data.append("YearOfExperience",         String(form.yearOfExperience));
    data.append("WorkingDistrict",          String(form.workingDistrict));
    data.append("AreaOfPractice",           String(form.areaOfPractice));
    data.append("BarAssociationMembership", String(form.barAssociationMembership));
    data.append("BarAssociationRegNo",      form.barAssociationRegNo);
    data.append("OfficeContactNumber",      form.officeContact);

    // Backend-managed defaults
    data.append("UserRole",           String(UserRole.Lawyer));
    data.append("RecordStatus",       "0");
    data.append("State",              String(State.Pending));
    data.append("VerificationStatus", String(VerificationStatus.Pending));
    data.append("AverageRating",      "0");
    data.append("IsDualAccount",      "false");

    console.log("[registerLawyer] FormData text fields appended");

    // Files
    appendFile(data, "ProfileImage",          form.profileImage);
    appendFile(data, "EnrollmentCertificate", form.enrollmentCertificate);
    appendFile(data, "NICFrontImage",         form.nicFrontImage);
    appendFile(data, "NICBackImage",          form.nicBackImage);

    console.log("[registerLawyer] Files →", {
        ProfileImage:          form.profileImage?.name          ?? "NOT PROVIDED",
        EnrollmentCertificate: form.enrollmentCertificate?.name ?? "NOT PROVIDED",
        NICFrontImage:         form.nicFrontImage?.name         ?? "NOT PROVIDED",
        NICBackImage:          form.nicBackImage?.name          ?? "NOT PROVIDED",
    });

    // ── HTTP call ────────────────────────────────────────────────────────────
    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.LAWYER.REGISTER}`;
    console.log("[registerLawyer] POST →", url);

    let response: Response;
    try {
        response = await fetch(url, { method: "POST", body: data });
    } catch (networkError) {
        console.error("[registerLawyer] Network error:", networkError);
        throw new Error("Network error. Please check your connection and try again.");
    }

    console.log("[registerLawyer] Response status:", response.status);

    const rawText = await response.text();
    console.log("[registerLawyer] Raw response body:", rawText);

    if (!rawText || rawText.trim() === "") {
        throw new Error(`Server returned an empty response (HTTP ${response.status})`);
    }

    let json: any;
    try {
        json = JSON.parse(rawText);
        console.log("[registerLawyer] Parsed JSON:", JSON.stringify(json, null, 2));
    } catch {
        throw new Error(`Unexpected server response (HTTP ${response.status}): ${rawText.slice(0, 200)}`);
    }

    if (!response.ok) {
        throw new Error(json?.error ?? json?.message ?? json?.Message ?? `Registration failed (HTTP ${response.status}).`);
    }

    console.log("[registerLawyer] Registration successful!");
    return json as CreateLawyerResponse;
};