export interface LawyerFinanceTransactionItemDto {
    paymentId: number;
    bookingId: number;
    referenceNo: string;
    clientDisplay: string;
    amount: number;
    transactionDate: string;
    status: "Verified Payment" | "Pending Verification" | "Rejected Payment";
}

export interface LawyerFinanceDashboardDto {
    totalEarnings: number;
    thisMonth: number;
    pendingVerification: number;
    transferredToBank: number;
    recentTransactions: LawyerFinanceTransactionItemDto[];
}

export interface LawyerTopClientIncomeDto {
    clientId: string;
    amount: number;
}

export interface LawyerEarningsReportDto {
    totalSessions: number;
    totalEarnings: number;
    verifiedAmount: number;
    pendingAmount: number;
    transferredAmount: number;
    topClients: LawyerTopClientIncomeDto[];
}