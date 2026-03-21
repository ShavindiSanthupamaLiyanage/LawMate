export interface ClientDashboardSummary {
    totalAppointments: number;
    contactedLawyers: number;
}

export interface AppointmentBreakdown {
    category: string;
    count: number;
}

export interface ClientActivity {
    bookingId: number;
    title: string;
    caseNumber: string;
    lawyerName: string;
    lawyerDetails: string;
    lawyerImage: number[] | null;
    status: string;
    filedDate: string;
}

export interface ClientDashboardHomeResponse {
    summary: ClientDashboardSummary;
    appointmentBreakdown: AppointmentBreakdown[];
    recentActivities: ClientActivity[];
}