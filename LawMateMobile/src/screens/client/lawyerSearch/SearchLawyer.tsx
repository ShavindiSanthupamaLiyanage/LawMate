import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../config/theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lawyer {
    id: string;
    name: string;
    barId: string;
    casesHandled: number;
    approved: boolean;
    profileImage?: string;
}

interface SearchFilters {
    caseArea: string;
    district: string;
    name: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CASE_AREAS = [
    'Criminal', 'Civil', 'Family', 'Corporate',
    'Intellectual Property', 'Labour', 'Land & Property', 'Immigration',
];

const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle',
];

const MOCK_LAWYERS: Lawyer[] = [
    { id: '1', name: 'Tharindu Bandara', barId: 'SL/2017/2346', casesHandled: 234, approved: true, profileImage: 'https://i.pravatar.cc/150?img=3' },
    { id: '2', name: 'Tharindu Bandara', barId: 'SL/2017/2346', casesHandled: 234, approved: true, profileImage: 'https://i.pravatar.cc/150?img=3' },
    { id: '3', name: 'Tharindu Bandara', barId: 'SL/2017/2346', casesHandled: 234, approved: true, profileImage: 'https://i.pravatar.cc/150?img=3' },
];

// ─── Dropdown Component ───────────────────────────────────────────────────────

interface DropdownProps {
    label: string;
    value: string;
    options: string[];
    onSelect: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onSelect }) => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.dropdownValue, !value && styles.dropdownPlaceholder]}>
                        {value || ''}
                    </Text>
                    <Text style={styles.chevron}>⌵</Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={visible}
                transparent
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                >
                    <View style={styles.modalSheet}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.modalOption,
                                        value === option && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        onSelect(option);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.modalOptionText,
                                        value === option && styles.modalOptionTextSelected,
                                    ]}>
                                        {option}
                                    </Text>
                                    {value === option && (
                                        <Text style={styles.modalOptionCheck}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

// ─── Lawyer Card ──────────────────────────────────────────────────────────────

interface LawyerCardProps {
    lawyer: Lawyer;
    onPress?: (lawyer: Lawyer) => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onPress }) => (
    <TouchableOpacity
        style={styles.lawyerCard}
        onPress={() => onPress?.(lawyer)}
        activeOpacity={0.75}
    >
        <View style={styles.lawyerAvatar}>
            {lawyer.profileImage ? (
                <Image source={{ uri: lawyer.profileImage }} style={styles.avatarImage} />
            ) : (
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                        {lawyer.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </Text>
                </View>
            )}
        </View>
        <View style={styles.lawyerInfo}>
            <Text style={styles.lawyerName}>{lawyer.name}</Text>
            <Text style={styles.lawyerBarId}>Bar ID: {lawyer.barId}</Text>
        </View>
        <View style={styles.lawyerMeta}>
            <Text style={styles.lawyerCases}>{lawyer.casesHandled} Cases Handled</Text>
            {lawyer.approved && (
                <View style={styles.approvedBadge}>
                    <Text style={styles.approvedText}>Approved</Text>
                </View>
            )}
        </View>
    </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

interface SearchLawyerScreenProps {
    navigation?: any;
}

const SearchLawyer: React.FC<SearchLawyerScreenProps> = ({ navigation }) => {
    const [filters, setFilters] = useState<SearchFilters>({
        caseArea: '',
        district: '',
        name: '',
    });
    const [results, setResults] = useState<Lawyer[] | null>(null);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setResults(null);
            setFilters({ caseArea: '', district: '', name: '' });
        }, [])
    );

    const handleSearch = async () => {
        setLoading(true);
        await new Promise((res) => setTimeout(res, 800));
        setResults(MOCK_LAWYERS);
        setLoading(false);
    };

    const handleLawyerPress = (lawyer: Lawyer) => {
        navigation?.navigate('AppointmentRequest', { lawyerId: lawyer.id });
    };

    // All three dropdowns must be selected to enable the button
    const isFormFilled =
        filters.caseArea !== '' &&
        filters.district !== '' &&
        filters.name !== '';

    const renderContent = () => {
        if (results !== null) {
            return (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <LawyerCard lawyer={item} onPress={handleLawyerPress} />
                    )}
                    contentContainerStyle={styles.resultsList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyStateText}>No lawyers found</Text>
                            <Text style={styles.emptyStateSubText}>
                                Try adjusting your search filters
                            </Text>
                        </View>
                    }
                />
            );
        }

        return (
            <View style={styles.formContainer}>
                <Dropdown
                    label="Case Area"
                    value={filters.caseArea}
                    options={CASE_AREAS}
                    onSelect={(val) => setFilters((f) => ({ ...f, caseArea: val }))}
                />
                <Dropdown
                    label="District"
                    value={filters.district}
                    options={DISTRICTS}
                    onSelect={(val) => setFilters((f) => ({ ...f, district: val }))}
                />
                <Dropdown
                    label="Name"
                    value={filters.name}
                    options={['M.S.Fernando', 'T.Bandara', 'R.Perera', 'K.Silva']}
                    onSelect={(val) => setFilters((f) => ({ ...f, name: val }))}
                />
            </View>
        );
    };

    return (
        <ClientLayout title="Search Lawyer" disableScroll>
            <View style={styles.screen}>
                <View style={styles.body}>{renderContent()}</View>

                {results === null && (
                    <View style={styles.footer}>
                        <Button
                            title="SEARCH A LAWYER"
                            variant="primary"
                            onPress={handleSearch}
                            loading={loading}
                            disabled={!isFormFilled}
                            style={styles.searchButton}
                        />
                    </View>
                )}
            </View>
        </ClientLayout>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background ?? '#F2F2F7',
    },
    body: {
        flex: 1,
    },
    formContainer: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingTop: spacing.lg ?? 20,
        gap: 6,
    },
    fieldWrapper: {
        marginBottom: 14,
    },
    fieldLabel: {
        fontSize: 12,
        color: '#9E9E9E',
        marginBottom: 4,
        fontWeight: '400',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 13,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    dropdownValue: {
        fontSize: 15,
        color: '#212121',
        flex: 1,
    },
    dropdownPlaceholder: {
        color: 'transparent',
    },
    chevron: {
        fontSize: 16,
        color: '#9E9E9E',
        marginTop: -4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 36,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 16,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F2',
    },
    modalOptionSelected: {},
    modalOptionText: {
        fontSize: 15,
        color: '#424242',
    },
    modalOptionTextSelected: {
        color: '#5B4BDB',
        fontWeight: '600',
    },
    modalOptionCheck: {
        color: '#5B4BDB',
        fontSize: 16,
        fontWeight: '700',
    },
    footer: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingBottom: spacing.lg ?? 20,
        paddingTop: 10,
    },
    searchButton: {
        width: '100%',
    },
    resultsList: {
        paddingHorizontal: spacing.lg ?? 20,
        paddingTop: spacing.md ?? 14,
        paddingBottom: spacing.lg ?? 20,
        gap: 10,
    },
    lawyerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 18,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    lawyerAvatar: {
        marginRight: 12,
    },
    avatarImage: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#D0CCF5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitials: {
        color: '#5B4BDB',
        fontSize: 16,
        fontWeight: '700',
    },
    lawyerInfo: {
        flex: 1,
    },
    lawyerName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#212121',
        marginBottom: 3,
    },
    lawyerBarId: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    lawyerMeta: {
        alignItems: 'flex-end',
        gap: 6,
    },
    lawyerCases: {
        fontSize: 11,
        color: '#9E9E9E',
        marginBottom: 4,
    },
    approvedBadge: {
        backgroundColor: '#E8F5E9',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    approvedText: {
        color: '#43A047',
        fontSize: 11,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#424242',
        marginBottom: 6,
    },
    emptyStateSubText: {
        fontSize: 13,
        color: '#9E9E9E',
    },
});

export default SearchLawyer;