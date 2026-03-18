import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
} from "../../../config/theme";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import { AdminFinanceStackParamList } from "./AdminFinanceStack";
import AdminLayout from "../../../components/AdminLayout";
import {useToast} from "../../../context/ToastContext";
import {AdminFinanceService} from "../../../services/adminFinanceService";

type Props = {
  route: RouteProp<AdminFinanceStackParamList, "FinanceView">;
  navigation: NativeStackNavigationProp<
      AdminFinanceStackParamList,
      "FinanceView"
  >;
};

export default function ViewFinanceDetailScreen({ route, navigation }: Props) {
  const { item } = route.params;

  // @ts-ignore
  const [transactionId, setTransactionId] = useState(item.code ?? "");
  const [accountNumber, setAccountNumber] = useState("");
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({
    transactionId: "",
    accountNumber: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      transactionId: "",
      accountNumber: "",
    };

    if (!transactionId.trim()) {
      newErrors.transactionId = "Transaction ID is required";
      isValid = false;
    }

    if (!accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
      isValid = false;
    } else if (accountNumber.length < 8) {
      newErrors.accountNumber = "Account number must be at least 8 digits";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirmPress = () => {
    if (validateForm()) {
      handleConfirmPayout();
    }
  };

  const handleConfirmPayout = async () => {
    setIsLoading(true);
    try {
      await AdminFinanceService.approveFinance(item.bookingId!, accountNumber);
      showSuccess("Payment has been successfully confirmed!");
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error) {
      showError("Failed to confirm payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const InfoRow = ({
                     label,
                     value,
                     highlight,
                   }: {
    label: string;
    value: string;
    highlight?: boolean;
  }) => (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>
          {value}
        </Text>
      </View>
  );

  return (
      <AdminLayout title="View Finance Details"
                   showBackButton
                   onBackPress={() => navigation.goBack()}
                   onProfilePress={() => navigation.getParent()?.navigate("AdminProfile")}>
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
          {/* Client Information Card */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{item.name}</Text>
                <Text style={styles.clientCategory}>{item.category}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>📧</Text>
                <Text style={styles.contactText}>
                  {item.email || "Not provided"}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>📱</Text>
                <Text style={styles.contactText}>
                  {item.phone || "Not provided"}
                </Text>
              </View>
              <View style={styles.contactRow}>
                <Text style={styles.contactIcon}>📅</Text>
                <Text style={styles.contactText}>
                  {item.sessionDate || "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Information Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>

            <InfoRow
                label="Service Type"
                value={item.serviceType || "Legal Consultation"}
            />
            <InfoRow
                label="Duration"
                value={item.duration ? `${item.duration} mins` : "1 Hour Session"}
            />
            <InfoRow
                label="Session Date"
                value={item.sessionDate || "Jan 28, 2025"}
            />
            <InfoRow
                label="Base Amount"
                value={item.baseAmount || "LKR 15,000.00"}
            />
            <InfoRow
                label="Platform Fee (10%)"
                value={item.platformFee || "LKR 150.00"}
            />

            <View style={styles.divider} />

            <InfoRow
                label="Total Pay Amount"
                value={item.totalAmount || "LKR 14,850.00"}
                highlight
            />
          </View>

          {/* Payout Details Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payout Details</Text>

            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentMethodContainer}>
              <TouchableOpacity
                  style={[styles.paymentMethodButton, styles.paymentMethodActive]}
                  disabled
              >
                <Text style={[styles.paymentMethodText, styles.paymentMethodTextActive]}>
                  Bank Transfer
                </Text>
              </TouchableOpacity>
            </View>

            <Input
                label="Transaction ID"
                value={transactionId}
                onChangeText={() => {}}
                placeholder="e.g., BANK/2025-0124-1452"
                editable={false}
            />

            {item.status === 'Paid Out' ? (
                // Read-only slip number for paid records
                <InfoRow label="Slip Number / Reference Number" value={item.slipNumber || '-'} />
            ) : (
                // Editable slip number for pending records
                <Input
                    label="Slip Number/ Reference Number"
                    value={accountNumber}
                    onChangeText={(text) => {
                      setAccountNumber(text);
                      if (errors.accountNumber) {
                        setErrors({ ...errors, accountNumber: "" });
                      }
                    }}
                    placeholder="Enter slip number"
                    keyboardType="numeric"
                    error={errors.accountNumber}
                />
            )}

            <InfoRow label="Paid Amount" value={item.totalAmount || item.amount} highlight />
          </View>

          {/* Action Buttons - only show for Pending */}
          {item.status === 'Pending' && (
              <View style={styles.buttonContainer}>
                <Button
                    title="Confirm"
                    onPress={handleConfirmPress}
                    variant="primary"
                    style={styles.confirmButton}
                    loading={isLoading}
                    disabled={isLoading}
                />
                <Button
                    title="Cancel"
                    onPress={() => navigation.goBack()}
                    variant="transparent"
                    style={styles.cancelButton}
                    disabled={isLoading}
                />
              </View>
          )}
        </ScrollView>
      </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },

  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },

  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  clientInfo: {
    flex: 1,
  },

  clientName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },

  clientCategory: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  contactInfo: {
    gap: spacing.sm,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  contactIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    width: 24,
  },

  contactText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },

  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },

  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },

  infoValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    textAlign: "right",
    flex: 1,
  },

  infoValueHighlight: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },

  paymentMethodContainer: {
    marginBottom: spacing.md,
  },

  paymentMethodButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },

  paymentMethodActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },

  paymentMethodText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textAlign: "center",
  },

  paymentMethodTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

  buttonContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  confirmButton: {
    marginBottom: spacing.xs,
  },

  cancelButton: {
    marginBottom: spacing.sm,
  },
});