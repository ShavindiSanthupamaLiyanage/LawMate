export interface ReportDownloadResult {
    success: boolean;
    fileName: string;
    message?: string;
}

export type ReportType =
    | 'lawyer-details'
    | 'client-details'
    | 'membership-renewals'
    | 'platform-commission'
    | 'monthly-revenue'
    | 'financial-summary';
