import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../config/theme';

interface YearMonthPickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (year: number, month: number) => void;
    initialYear?: number;
    initialMonth?: number;
    maximumDate?: Date;
}

const YearMonthPicker: React.FC<YearMonthPickerProps> = ({
                                                             visible,
                                                             onClose,
                                                             onConfirm,
                                                             initialYear,
                                                             initialMonth,
                                                             maximumDate = new Date(),
                                                         }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth !== undefined ? initialMonth : currentMonth);
    const [activeTab, setActiveTab] = useState<'month' | 'year'>('month');

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate years from 2015 to current year
    const startYear = 2015;
    const endYear = maximumDate.getFullYear();
    const years: number[] = [];
    for (let year = endYear; year >= startYear; year--) {
        years.push(year);
    }

    const handleConfirm = () => {
        onConfirm(selectedYear, selectedMonth);
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const handleYearSelect = (year: number) => {
        setSelectedYear(year);
        setActiveTab('month'); // Switch back to month tab after selecting year
    };

    const getYearRows = () => {
        const rows: number[][] = [];
        for (let i = 0; i < years.length; i += 4) {
            rows.push(years.slice(i, i + 4));
        }
        return rows;
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header with Gradient */}
                    <LinearGradient
                        colors={[
                            'rgba(24,114,234,1)',
                            'rgba(54,87,208,1)',
                            'rgba(77,55,200,1)',
                            'rgba(99,71,253,1)',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientHeader}
                    >
                        {/* Header Title */}
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>SELECT MONTH/YEAR</Text>
                        </View>

                        {/* Selected Display */}
                        <View style={styles.selectedDisplay}>
                            <Text style={styles.selectedText}>
                                {months[selectedMonth]} {selectedYear}
                            </Text>
                        </View>
                    </LinearGradient>

                    {/* Tab Selector */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'month' && styles.activeTab
                            ]}
                            onPress={() => setActiveTab('month')}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === 'month' && styles.activeTabText
                            ]}>
                                Select Month
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'year' && styles.activeTab
                            ]}
                            onPress={() => setActiveTab('year')}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === 'year' && styles.activeTabText
                            ]}>
                                Select Year
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content Area */}
                    <View style={styles.contentContainer}>
                        {activeTab === 'month' ? (
                            // Months Grid
                            <View style={styles.monthsContainer}>
                                {months.map((month, index) => (
                                    <TouchableOpacity
                                        key={month}
                                        style={[
                                            styles.monthButton,
                                            selectedMonth === index && styles.selectedMonthButton
                                        ]}
                                        onPress={() => setSelectedMonth(index)}
                                    >
                                        <Text style={[
                                            styles.monthButtonText,
                                            selectedMonth === index && styles.selectedMonthButtonText
                                        ]}>
                                            {month.substring(0, 3)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            // Years Grid
                            <ScrollView
                                style={styles.yearsScrollView}
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={styles.yearsScrollContent}
                            >
                                {getYearRows().map((row, rowIndex) => (
                                    <View key={rowIndex} style={styles.yearRow}>
                                        {row.map((year) => (
                                            <TouchableOpacity
                                                key={year}
                                                style={[
                                                    styles.yearButton,
                                                    selectedYear === year && styles.selectedYearButton
                                                ]}
                                                onPress={() => handleYearSelect(year)}
                                            >
                                                <Text style={[
                                                    styles.yearButtonText,
                                                    selectedYear === year && styles.selectedYearButtonText
                                                ]}>
                                                    {year}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ))}
                            </ScrollView>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleCancel}
                        >
                            <Text style={styles.cancelButtonText}>CANCEL</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={handleConfirm}
                        >
                            <Text style={styles.okButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    container: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.sm,
        width: '100%',
        maxWidth: 400,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    gradientHeader: {
        width: '100%',
    },
    header: {
        padding: spacing.md,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    headerTitle: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: colors.white,
        letterSpacing: 1,
    },
    selectedDisplay: {
        padding: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
    },
    selectedText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.regular,
        color: colors.white,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderLight,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    contentContainer: {
        backgroundColor: colors.white,
        minHeight: 280,
        maxHeight: 320,
    },
    monthsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.xs,
        // paddingTop: spacing.md,
    },
    monthButton: {
        width: '33.33%',
        paddingVertical: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedMonthButton: {
        backgroundColor: 'transparent',
    },
    monthButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.regular,
    },
    selectedMonthButtonText: {
        color: colors.primary,
        fontWeight: fontWeight.bold,
        fontSize: fontSize.lg,
    },
    yearsScrollView: {
        flex: 1,
    },
    yearsScrollContent: {
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    yearRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    yearButton: {
        width: '23%',
        paddingVertical: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.full,
    },
    selectedYearButton: {
        backgroundColor: colors.primary,
    },
    yearButtonText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        fontWeight: fontWeight.regular,
    },
    selectedYearButtonText: {
        color: colors.white,
        fontWeight: fontWeight.medium,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: spacing.md,
        paddingTop: spacing.sm,
        gap: spacing.lg,
        borderTopWidth: 1,
        borderTopColor: colors.borderLight,
    },
    actionButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    cancelButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.textSecondary,
        letterSpacing: 0.5,
    },
    okButtonText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        letterSpacing: 0.5,
    },
});

export default YearMonthPicker;