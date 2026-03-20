import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ClientLayout from "../../../components/ClientLayout";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";
import { ClientDashboardService } from "../../../services/clientDashboardService";
import { ClientActivity } from "../../../interfaces/clientDashboard.interface";

type ActivityStatus = string;

const statusColors = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "completed" || normalized === "verified") {
        return { bg: "#EAF8EE", fg: "#2E9B4B" };
    }

    return { bg: "#E8F0FF", fg: "#2F6BFF" };
};

const normalizeStatus = (status: string): "Active" | "Completed" => {
    const normalized = status.toLowerCase();

    if (normalized === "completed" || normalized === "verified") {
        return "Completed";
    }

    return "Active";
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const ActivityCard: React.FC<{
    title: string;
    caseId: string;
    status: ActivityStatus;
    lawyerName: string;
    lawyerMeta1: string;
    lawyerMeta2: string;
    filedDate: string;
    avatarUri?: string;
}> = ({
          title,
          caseId,
          status,
          lawyerName,
          lawyerMeta1,
          lawyerMeta2,
          filedDate,
          avatarUri,
      }) => {
    const st = statusColors(status);

    return (
        <View style={styles.activityCard}>
            <View style={styles.activityTopRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.activityTitle}>{title}</Text>
                    <Text style={styles.activityCaseId}>Case #{caseId}</Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusText, { color: st.fg }]}>{status}</Text>
                </View>
            </View>

            <View style={styles.lawyerRow}>
                <Image
                    source={
                        avatarUri
                            ? { uri: avatarUri }
                            : { uri: "https://i.pravatar.cc/100?img=12" }
                    }
                    style={styles.avatar}
                />

                <View style={{ flex: 1 }}>
                    <Text style={styles.lawyerName}>{lawyerName}</Text>
                    <Text style={styles.lawyerMeta}>{lawyerMeta1}</Text>
                    {!!lawyerMeta2 && <Text style={styles.lawyerMeta}>{lawyerMeta2}</Text>}
                </View>
            </View>

            <Text style={styles.filedText}>Filed: {filedDate}</Text>
        </View>
    );
};

const ClientActivityList: React.FC = () => {
    const navigation = useNavigation<any>();

    const [activities, setActivities] = useState<ClientActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadActivities = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await ClientDashboardService.getDashboardActivity();
                setActivities(data);
            } catch (err: any) {
                setError(err?.message || "Failed to load activities");
            } finally {
                setLoading(false);
            }
        };

        loadActivities();
    }, []);

    if (loading) {
        return (
            <ClientLayout title="My Activity" showBackButton onBackPress={() => navigation.goBack()}>
                <View style={styles.centerState}>
                    <Text>Loading activities...</Text>
                </View>
            </ClientLayout>
        );
    }

    if (error) {
        return (
            <ClientLayout title="My Activity" showBackButton onBackPress={() => navigation.goBack()}>
                <View style={styles.centerState}>
                    <Text>{error}</Text>
                </View>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout title="My Activity" showBackButton onBackPress={() => navigation.goBack()}>
            <View style={styles.body}>
                {activities.length ? (
                    activities.map((activity) => (
                        <ActivityCard
                            key={activity.bookingId}
                            title={activity.title}
                            caseId={activity.caseNumber}
                            status={normalizeStatus(activity.status)}
                            lawyerName={activity.lawyerName}
                            lawyerMeta1={activity.lawyerDetails}
                            lawyerMeta2=""
                            filedDate={formatDate(activity.filedDate)}
                        />
                    ))
                ) : (
                    <Text style={styles.emptyText}>No activity available.</Text>
                )}
            </View>
        </ClientLayout>
    );
};

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
    },

    centerState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.lg,
    },

    emptyText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: "center",
        marginTop: spacing.lg,
    },

    activityCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: colors.shadow,
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
    },
    activityTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    activityTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    activityCaseId: {
        marginTop: 4,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        marginLeft: spacing.md,
    },
    statusText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
    },

    lawyerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        marginTop: spacing.md,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
    },
    lawyerName: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
    },
    lawyerMeta: {
        marginTop: 2,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
    filedText: {
        marginTop: spacing.md,
        fontSize: fontSize.xs,
        color: colors.textSecondary,
    },
});

export default ClientActivityList;