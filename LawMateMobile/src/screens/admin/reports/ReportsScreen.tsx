import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../../config/theme';
import AdminLayout from '../../../components/AdminLayout';
import ReportCard from './ReportCard';
import YearMonthPicker from '../../../components/YearMonthPicker';
import { useToast } from '../../../context/ToastContext';

interface Report {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
}

const ReportsScreen: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const { showToast } = useToast();

    const reports: Report[] = [
        {
            id: '1',
            icon: 'people-outline',
            title: 'Lawyer Detail Report',
        },
        {
            id: '2',
            icon: 'person-outline',
            title: 'Client Detail Report',
        },
        {
            id: '3',
            icon: 'ribbon-outline',
            title: 'Member Renewal Report',
        },
        {
            id: '4',
            icon: 'analytics',
            title: 'Platform Commission Report',
        },
        {
            id: '5',
            icon: 'bar-chart-outline',
            title: 'Monthly Revenue Report',
        },
        {
            id: '6',
            icon: 'pie-chart-outline',
            title: 'Financial Summary Report',
        },
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleDownload = (reportTitle: string) => {
        if (selectedMonth === null || selectedYear === null) {
            showToast('Please select year and month first', 'warning');
            return;
        }

        console.log('Downloading:', reportTitle, 'for', months[selectedMonth], selectedYear);
        showToast('Report downloaded successfully', 'success');
    };

    const handleDateSelect = () => {
        setShowDatePicker(true);
    };

    const handleDateConfirm = (year: number, month: number) => {
        setSelectedYear(year);
        setSelectedMonth(month);
    };

    const getFormattedDate = (): string => {
        if (selectedMonth === null || selectedYear === null) {
            return 'MM YYYY';
        }
        const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
        return `${monthStr} ${selectedYear}`;
    };

    return (
        <AdminLayout userName="Kavindu Gimsara">
            <View style={styles.container}>
                {/* Date Filter */}
                <View style={styles.dateFilterContainer}>
                    <TouchableOpacity
                        style={styles.dateInput}
                        onPress={handleDateSelect}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.dateInputText,
                            (selectedMonth === null || selectedYear === null) && styles.placeholderText
                        ]}>
                            {getFormattedDate()}
                        </Text>
                        <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Reports List */}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {reports.map((report) => (
                        <ReportCard
                            key={report.id}
                            icon={report.icon}
                            title={report.title}
                            onDownload={() => handleDownload(report.title)}
                        />
                    ))}

                    {/* Bottom Spacer */}
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                {/* Year-Month Picker */}
                <YearMonthPicker
                    visible={showDatePicker}
                    onClose={() => setShowDatePicker(false)}
                    onConfirm={handleDateConfirm}
                    initialYear={selectedYear || undefined}
                    initialMonth={selectedMonth || undefined}
                    maximumDate={new Date()}
                />
            </View>
        </AdminLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    dateFilterContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    dateInputText: {
        fontSize: fontSize.md,
        color: colors.textPrimary,
    },
    placeholderText: {
        color: colors.textSecondary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: spacing.sm,
    },
    bottomSpacer: {
        height: 20,
    },
});

export default ReportsScreen;