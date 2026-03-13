// import React from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     Image,
//     ScrollView,
// } from "react-native";
// import { useRoute, useNavigation } from "@react-navigation/native";
// import { Ionicons } from "@expo/vector-icons";
// import { spacing, colors, fontSize, fontWeight, borderRadius } from "../../../../config/theme";
// import AdminLayout from "../../../../components/AdminLayout";
// import Button from "../../../../components/Button";
//
// const ClientProfileScreen = () => {
//     const route = useRoute<any>();
//     const navigation = useNavigation<any>();
//
//     const { client } = route.params;
//
//     const handleSuspend = () => {
//         console.log("Suspend client:", client.id);
//         navigation.goBack();
//     };
//
//     return (
//         <AdminLayout title="Client Profile"
//                      showBackButton
//                      onBackPress={() => navigation.navigate("ClientVerification")}
//                      onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
//         >
//
//             <ScrollView
//                 showsVerticalScrollIndicator={false}
//                 contentContainerStyle={styles.scrollContent}
//             >
//
//                 {/* Profile Card */}
//                 <View style={styles.profileCard}>
//
//                     <View style={styles.profileImageContainer}>
//                         {client.image ? (
//                             <Image
//                                 source={{ uri: client.image }}
//                                 style={styles.profileImage}
//                             />
//                         ) : (
//                             <View style={styles.defaultProfileImage}>
//                                 <Ionicons name="person" size={60} color={colors.textSecondary} />
//                             </View>
//                         )}
//                     </View>
//
//                     <Text style={styles.profileName}>{client.name}</Text>
//
//                     <Text style={styles.profileEmail}>{client.email}</Text>
//
//                     <View style={styles.statusBadge}>
//                         <Text style={styles.statusText}>{client.status}</Text>
//                     </View>
//
//                 </View>
//
//                 {/* Personal Details */}
//                 <View style={styles.detailsCard}>
//
//                     <Text style={styles.sectionTitle}>Personal Details</Text>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Name</Text>
//                         <Text style={styles.value}>{client.name}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Email</Text>
//                         <Text style={styles.value}>{client.email}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Contact Number</Text>
//                         <Text style={styles.value}>{client.contactNumber}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>NIC</Text>
//                         <Text style={styles.value}>{client.nic}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Date of Birth</Text>
//                         <Text style={styles.value}>{client.dateOfBirth}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Gender</Text>
//                         <Text style={styles.value}>{client.gender}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Nationality</Text>
//                         <Text style={styles.value}>{client.nationality}</Text>
//                     </View>
//
//                     <View style={styles.detailRow}>
//                         <Text style={styles.label}>Address</Text>
//                         <Text style={styles.value}>{client.address}</Text>
//                     </View>
//
//                 </View>
//
//                 {/* Suspend Button */}
//                 {client.status === "Active" && (
//                     <View style={styles.buttonContainer}>
//                         <Button
//                             title="Suspend Client"
//                             variant="reject"
//                             onPress={handleSuspend}
//                         />
//                     </View>
//                 )}
//
//             </ScrollView>
//
//         </AdminLayout>
//     );
// };
//
// export default ClientProfileScreen;
//
// const styles = StyleSheet.create({
//
//     scrollContent: {
//         padding: spacing.lg,
//         paddingBottom: 40,
//     },
//
//     profileCard: {
//         backgroundColor: colors.white,
//         borderRadius: borderRadius.xl,
//         padding: spacing.lg,
//         alignItems: "center",
//         marginBottom: spacing.lg,
//         elevation: 4,
//         shadowColor: colors.shadow,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 6,
//     },
//
//     profileImageContainer: {
//         marginBottom: spacing.md,
//     },
//
//     profileImage: {
//         width: 120,
//         height: 120,
//         borderRadius: 60,
//         borderWidth: 4,
//         borderColor: colors.white,
//     },
//
//     defaultProfileImage: {
//         width: 120,
//         height: 120,
//         borderRadius: 60,
//         backgroundColor: colors.background,
//         justifyContent: "center",
//         alignItems: "center",
//     },
//
//     profileName: {
//         fontSize: fontSize.xxl,
//         fontWeight: fontWeight.bold,
//         color: colors.textPrimary,
//     },
//
//     profileEmail: {
//         fontSize: fontSize.md,
//         color: colors.textSecondary,
//         marginTop: spacing.xs,
//         marginBottom: spacing.sm,
//     },
//
//     statusBadge: {
//         backgroundColor: "#E8F5E9",
//         paddingHorizontal: spacing.md,
//         paddingVertical: spacing.xs,
//         borderRadius: borderRadius.lg,
//     },
//
//     statusText: {
//         color: "#2E7D32",
//         fontWeight: fontWeight.medium,
//         fontSize: fontSize.sm,
//     },
//
//     detailsCard: {
//         backgroundColor: colors.white,
//         borderRadius: borderRadius.lg,
//         padding: spacing.md,
//         elevation: 2,
//         shadowColor: colors.shadow,
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.08,
//         shadowRadius: 4,
//     },
//
//     sectionTitle: {
//         fontSize: fontSize.lg,
//         fontWeight: fontWeight.bold,
//         marginBottom: spacing.md,
//         color: colors.textPrimary,
//     },
//
//     detailRow: {
//         borderBottomWidth: 1,
//         borderBottomColor: colors.borderLight,
//         paddingVertical: spacing.md,
//     },
//
//     label: {
//         fontSize: fontSize.sm,
//         color: colors.textSecondary,
//         marginBottom: 2,
//     },
//
//     value: {
//         fontSize: fontSize.md,
//         fontWeight: fontWeight.medium,
//         color: colors.textPrimary,
//     },
//
//     buttonContainer: {
//         marginTop: spacing.lg,
//     },
//
// });


import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, colors, fontSize, fontWeight, borderRadius } from "../../../../config/theme";
import AdminLayout from "../../../../components/AdminLayout";
import Button from "../../../../components/Button";
import {
    PrefixOptions,
    GenderOptions,
    DistrictOptions,
    LanguageOptions,
} from "../../../../enum/enumOptions";

// ── helper ────────────────────────────────────────────────────────────────────

const findLabel = (
    options: { label: string; value: number }[],
    value: number
): string => options.find(o => o.value === value)?.label ?? "—";

// ── component ─────────────────────────────────────────────────────────────────

const ClientProfileScreen = () => {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();

    const { client } = route.params;

    const displayName = `${findLabel(PrefixOptions, client.prefix)} ${client.name}`.trim();

    const formattedDate = client.registrationDate
        ? new Date(client.registrationDate).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
        })
        : "—";

    const handleSuspend = () => {
        console.log("Suspend client:", client.id);
        navigation.goBack();
    };

    return (
        <AdminLayout
            title="Client Profile"
            showBackButton
            onBackPress={() => navigation.navigate("ClientVerification")}
            onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        {client.image ? (
                            <Image
                                source={{ uri: client.image }}
                                style={styles.profileImage}
                            />
                        ) : (
                            <View style={styles.defaultProfileImage}>
                                <Ionicons name="person" size={60} color={colors.textSecondary} />
                            </View>
                        )}
                    </View>

                    <Text style={styles.profileName}>{displayName}</Text>
                    <Text style={styles.profileEmail}>{client.email}</Text>

                    <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>{client.status}</Text>
                    </View>
                </View>

                {/* Personal Details */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Personal Details</Text>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Name</Text>
                        <Text style={styles.value}>{displayName}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{client.email}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Contact Number</Text>
                        <Text style={styles.value}>{client.contactNumber || "—"}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>NIC</Text>
                        <Text style={styles.value}>{client.nic}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Gender</Text>
                        <Text style={styles.value}>{findLabel(GenderOptions, client.gender)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Address</Text>
                        <Text style={styles.value}>{client.address || "—"}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>District</Text>
                        <Text style={styles.value}>{findLabel(DistrictOptions, client.district)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Preferred Language</Text>
                        <Text style={styles.value}>{findLabel(LanguageOptions, client.preferredLanguage)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.label}>Registered On</Text>
                        <Text style={styles.value}>{formattedDate}</Text>
                    </View>
                </View>

                {/* Suspend Button */}
                {client.status === "Active" && (
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Suspend Client"
                            variant="reject"
                            onPress={handleSuspend}
                        />
                    </View>
                )}
            </ScrollView>
        </AdminLayout>
    );
};

export default ClientProfileScreen;

const styles = StyleSheet.create({
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: 40,
    },
    profileCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        alignItems: "center",
        marginBottom: spacing.lg,
        elevation: 4,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    profileImageContainer: {
        marginBottom: spacing.md,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: colors.white,
    },
    defaultProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    profileName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.textPrimary,
    },
    profileEmail: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.sm,
    },
    statusBadge: {
        backgroundColor: "#E8F5E9",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.lg,
    },
    statusText: {
        color: "#2E7D32",
        fontWeight: fontWeight.medium,
        fontSize: fontSize.sm,
    },
    detailsCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        elevation: 2,
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        marginBottom: spacing.md,
        color: colors.textPrimary,
    },
    detailRow: {
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
        paddingVertical: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    value: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
    },
    buttonContainer: {
        marginTop: spacing.lg,
    },
});







// import React from "react";
// import {
//     View,
//     Text,
//     StyleSheet,
//     ScrollView,
//     Image,
// } from "react-native";
// import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
// import { colors, spacing, fontSize, fontWeight, borderRadius } from "../../../../config/theme";
// import AdminLayout from "../../../../components/AdminLayout";
// import {
//     PrefixOptions,
//     GenderOptions,
//     DistrictOptions,
//     LanguageOptions,
// } from "../../../../enum/enumOptions";
//
// // ── route params ──────────────────────────────────────────────────────────────
//
// type ClientProfileParams = {
//     ClientProfile: {
//         client: {
//             id:                string;
//             prefix:            number;
//             name:              string;
//             nic:               string;
//             email:             string;
//             gender:            number;
//             contactNumber:     string;
//             state:             number;
//             registrationDate:  string;
//             address:           string;
//             district:          number;
//             preferredLanguage: number;
//             image:             string | null;
//             status:            string;
//         };
//         viewOnly?: boolean;
//     };
// };
//
// // ── helpers ───────────────────────────────────────────────────────────────────
//
// const findLabel = (
//     options: { label: string; value: number }[],
//     value: number
// ): string => options.find(o => o.value === value)?.label ?? "—";
//
// const StatusColors: Record<string, { bg: string; text: string }> = {
//     Active:   { bg: "#D4F4E2", text: "#1E8E5A" },
//     Rejected: { bg: "#FAD4D4", text: "#C53030" },
//     Pending:  { bg: "#FEF3C7", text: "#B7791F" },
// };
//
// const InfoRow = ({ label, value }: { label: string; value: string }) => (
//     <View style={styles.infoRow}>
//         <Text style={styles.infoLabel}>{label}</Text>
//         <Text style={styles.infoValue}>{value || "—"}</Text>
//     </View>
// );
//
// // ── component ─────────────────────────────────────────────────────────────────
//
// const ClientProfileScreen = () => {
//     const navigation = useNavigation<any>();
//     const route = useRoute<RouteProp<ClientProfileParams, "ClientProfile">>();
//     const { client } = route.params;
//
//     const statusColor = StatusColors[client.status] ?? StatusColors.Pending;
//
//     const displayName = `${findLabel(PrefixOptions, client.prefix)} ${client.name}`.trim();
//
//     const formattedDate = client.registrationDate
//         ? new Date(client.registrationDate).toLocaleDateString("en-GB", {
//             day: "2-digit", month: "short", year: "numeric",
//         })
//         : "—";
//
//     return (
//         <AdminLayout
//             title="Client Profile"
//             showBackButton
//             disableScroll
//             onBackPress={() => navigation.goBack()}
//             onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}
//         >
//             <ScrollView
//                 style={styles.scroll}
//                 contentContainerStyle={styles.scrollContent}
//                 showsVerticalScrollIndicator={false}
//             >
//                 {/* ── Avatar + name + status ── */}
//                 <View style={styles.heroCard}>
//                     {client.image
//                         ? <Image source={{ uri: client.image }} style={styles.avatar} />
//                         : (
//                             <View style={styles.avatarFallback}>
//                                 <Text style={styles.avatarInitials}>
//                                     {client.name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
//                                 </Text>
//                             </View>
//                         )
//                     }
//                     <Text style={styles.heroName}>{displayName}</Text>
//                     <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
//                         <Text style={[styles.statusText, { color: statusColor.text }]}>
//                             {client.status}
//                         </Text>
//                     </View>
//                 </View>
//
//                 {/* ── Details card ── */}
//                 <View style={styles.detailCard}>
//                     <Text style={styles.sectionTitle}>Personal Information</Text>
//                     <InfoRow label="NIC"           value={client.nic} />
//                     <InfoRow label="Gender"        value={findLabel(GenderOptions,   client.gender)} />
//                     <InfoRow label="Email"         value={client.email} />
//                     <InfoRow label="Contact"       value={client.contactNumber} />
//                     <InfoRow label="Address"       value={client.address} />
//                     <InfoRow label="District"      value={findLabel(DistrictOptions, client.district)} />
//                     <InfoRow label="Language"      value={findLabel(LanguageOptions, client.preferredLanguage)} />
//                     <InfoRow label="Registered On" value={formattedDate} />
//                 </View>
//             </ScrollView>
//         </AdminLayout>
//     );
// };
//
// export default ClientProfileScreen;
//
// // ── styles ────────────────────────────────────────────────────────────────────
//
// const styles = StyleSheet.create({
//     scroll: {
//         flex: 1,
//     },
//     scrollContent: {
//         padding: spacing.lg,
//         gap: spacing.md,
//     },
//     heroCard: {
//         backgroundColor: colors.white,
//         borderRadius: borderRadius.lg,
//         alignItems: "center",
//         paddingVertical: spacing.xl,
//         paddingHorizontal: spacing.lg,
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.06,
//         shadowRadius: 3,
//     },
//     avatar: {
//         width: 90,
//         height: 90,
//         borderRadius: 45,
//         marginBottom: spacing.md,
//     },
//     avatarFallback: {
//         width: 90,
//         height: 90,
//         borderRadius: 45,
//         backgroundColor: colors.primaryLight,
//         justifyContent: "center",
//         alignItems: "center",
//         marginBottom: spacing.md,
//     },
//     avatarInitials: {
//         fontSize: fontSize.xxl,
//         fontWeight: fontWeight.bold,
//         color: colors.white,
//     },
//     heroName: {
//         fontSize: fontSize.lg,
//         fontWeight: fontWeight.bold,
//         color: colors.textPrimary,
//         marginBottom: spacing.sm,
//         textAlign: "center",
//     },
//     statusBadge: {
//         paddingHorizontal: spacing.md,
//         paddingVertical: 4,
//         borderRadius: borderRadius.full,
//     },
//     statusText: {
//         fontSize: fontSize.sm,
//         fontWeight: fontWeight.semibold,
//     },
//     detailCard: {
//         backgroundColor: colors.white,
//         borderRadius: borderRadius.lg,
//         padding: spacing.lg,
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.06,
//         shadowRadius: 3,
//     },
//     sectionTitle: {
//         fontSize: fontSize.md,
//         fontWeight: fontWeight.bold,
//         color: colors.textPrimary,
//         marginBottom: spacing.md,
//     },
//     infoRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "flex-start",
//         paddingVertical: spacing.sm,
//         borderBottomWidth: 1,
//         borderBottomColor: colors.borderLight,
//     },
//     infoLabel: {
//         fontSize: fontSize.sm,
//         color: colors.textSecondary,
//         fontWeight: fontWeight.medium,
//         flex: 1,
//     },
//     infoValue: {
//         fontSize: fontSize.sm,
//         color: colors.textPrimary,
//         fontWeight: fontWeight.semibold,
//         flex: 2,
//         textAlign: "right",
//     },
// });