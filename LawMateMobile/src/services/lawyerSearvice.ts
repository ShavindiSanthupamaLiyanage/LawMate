import apiClient from '../api/httpClient';
import { ENDPOINTS } from '../config/api.config';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DropdownItem {
    value: number | string;
    label: string;
}

export interface LawyerSearchDropdownsDto {
    areasOfPractice: DropdownItem[];
    districts: DropdownItem[];
    lawyerNames: DropdownItem[];
}

export interface LawyerSearchResultDto {
    lawyerId: string;
    fullName: string;
    profileImageBase64?: string;
    areaOfPractice: string;
    workingDistrict: string;
    professionalDesignation?: string;
    yearOfExperience: number;
    averageRating: number;
    bio?: string;
    officeContactNumber?: string;
}

export interface LawyerSearchFilters {
    areaOfPractice?: number;
    district?: number;
    nameSearch?: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class LawyerSearchService {

    static async getDropdowns(): Promise<LawyerSearchDropdownsDto> {
        const response = await apiClient.get<LawyerSearchDropdownsDto>(
            ENDPOINTS.CLIENT.LAWYER_SEARCH_DROPDOWNS
        );
        return response.data;
    }

    static async searchLawyers(
        filters: LawyerSearchFilters
    ): Promise<LawyerSearchResultDto[]> {
        const response = await apiClient.get<LawyerSearchResultDto[]>(
            ENDPOINTS.CLIENT.LAWYER_SEARCH,
            { params: filters }   // axios serializes undefined fields automatically
        );
        return response.data;
    }
}