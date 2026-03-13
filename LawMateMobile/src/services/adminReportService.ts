import * as Sharing from 'expo-sharing';
import { ENDPOINTS, API_CONFIG } from '../config/api.config';
import { ReportType } from '../interfaces/adminReport.interface';
import { StorageService } from '../utils/storage';

export class AdminReportService {

    private static readonly endpointMap: Record<ReportType, string> = {
        'lawyer-details': ENDPOINTS.ADMIN.REPORTS.LAWYER_DETAILS,
        'client-details': ENDPOINTS.ADMIN.REPORTS.CLIENT_DETAILS,
        'membership-renewals': ENDPOINTS.ADMIN.REPORTS.MEMBERSHIP_RENEWALS,
        'platform-commission': ENDPOINTS.ADMIN.REPORTS.PLATFORM_COMMISSION,
        'monthly-revenue': ENDPOINTS.ADMIN.REPORTS.MONTHLY_REVENUE,
        'financial-summary': ENDPOINTS.ADMIN.REPORTS.FINANCIAL_SUMMARY,
    };

    static async downloadReport(reportType: ReportType): Promise<void> {
        const endpoint = this.endpointMap[reportType];
        const token = await StorageService.getToken();
        const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
        const fileName = `LawMate_${reportType}_${Date.now()}.xlsx`;

        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });

        if (!response.ok) {
            throw new Error(`Download failed with status ${response.status}`);
        }

        // Get raw binary data as ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Use Paths.cache Directory instance directly (not .uri string)
        const { Paths, File } = require('expo-file-system');
        const file = new File(Paths.cache, fileName);
        console.log('Writing to:', file.uri);

        // Write binary data via WritableStream
        const writableStream = file.writableStream();
        const writer = writableStream.getWriter();
        await writer.write(uint8Array);
        await writer.close();

        console.log('File written, sharing...');

        await Sharing.shareAsync(file.uri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Save Report',
        });
    }
}