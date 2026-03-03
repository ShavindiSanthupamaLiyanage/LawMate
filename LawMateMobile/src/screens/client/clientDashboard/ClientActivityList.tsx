import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

import ClientLayout from "../../../components/ClientLayout";
import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../config/theme";

type ActivityStatus = "Active" | "Completed";

const statusColors = (status: ActivityStatus) => {
    if (status === "Active") return { bg: "#E8F0FF", fg: "#2F6BFF" };
    return { bg: "#EAF8EE", fg: "#2E9B4B" };
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
                    <Text style={styles.lawyerMeta}>{lawyerMeta2}</Text>
                </View>
            </View>

            <Text style={styles.filedText}>Filed: {filedDate}</Text>
        </View>
    );
};

const ClientActivityList: React.FC = () => {
    const navigation = useNavigation<any>();

    // Replace with API data later
    const activities = [
        {
            title: "Property Dispute",
            caseId: "LC2024-001",
            status: "Active" as const,
            lawyerName: "Mr. Roshan Manawadu",
            lawyerMeta1: "LL.B (UoL), BSc in Science in International",
            lawyerMeta2: "Commercial & Business Lawyer and MBA.",
            filedDate: "Nov 20, 2025",
            avatarUri: "https://i.pravatar.cc/100?img=12",
        },
        {
            title: "Divorce Settlement",
            caseId: "LC2024-002",
            status: "Completed" as const,
            lawyerName: "Mrs. Dhana de Silva",
            lawyerMeta1: "LL.B (UoL), BSc in Science in International",
            lawyerMeta2: "Commercial & Business Lawyer and MBA.",
            filedDate: "Nov 10, 2025",
            avatarUri: "https://i.pravatar.cc/100?img=44",
        },

        // add more…
    ];

    return (
        <ClientLayout title="My Activity" showBackButton onBackPress={() => navigation.goBack()}>
            <View style={styles.body}>
                {activities.map((a) => (
                    <ActivityCard key={a.caseId} {...a} />
                ))}
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