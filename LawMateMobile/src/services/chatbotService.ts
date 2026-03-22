import { API_CONFIG, ENDPOINTS } from '../config/api.config';

export interface ChatbotClassificationResponse {
    suggestedLawyerCategory: string;
    shortReason: string;
    disclaimer: string;
    isSmallTalk: boolean;
    showCategoryCard: boolean;
    assistantMessage: string;

}

// Maps chatbot categories → SearchLawyer CASE_AREAS values
export const CATEGORY_TO_CASE_AREA: Record<string, string> = {
    'Family Law':                    'Family',
    'Criminal Law':                  'Criminal',
    'Property Law':                  'Land & Property',
    'Employment Law':                'Labour',
    'Civil Law / Civil Disputes':    'Civil',
    'Business / Commercial Law':     'Corporate',
    'General Consultation':          '',   // no pre-filter
    'Not a Legal Matter':            '',   // no pre-filter
};

export const classifyLegalIssue = async (
    issueText: string
): Promise<ChatbotClassificationResponse> => {
    const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.CHATBOT.CLASSIFY}`;

    console.log('[Chatbot] Sending request:', { url, issueText });

    const response = await fetch(url, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ issueText }),
    });

    console.log('[Chatbot] Response status:', response.status, response.statusText);

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('[Chatbot] Request failed:', errorBody);
        throw new Error('Failed to classify issue');
    }

    const data: ChatbotClassificationResponse = await response.json();
    console.log('[Chatbot] Classification result:', data);

    return data;
};