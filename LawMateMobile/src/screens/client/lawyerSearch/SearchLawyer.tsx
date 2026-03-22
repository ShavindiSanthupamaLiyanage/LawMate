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
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ClientLayout from '../../../components/ClientLayout';
import Button from '../../../components/Button';
import { colors, spacing } from '../../../config/theme';
import {
    LawyerSearchService,
    LawyerSearchDropdownsDto,
    LawyerSearchResultDto,
    DropdownItem,
} from '../../../services/lawyerSearvice';

interface SearchFilters {
    caseArea: DropdownItem | null;
    district: DropdownItem | null;
    lawyerName: DropdownItem | null;
}

const EMPTY_DROPDOWNS: LawyerSearchDropdownsDto = {
    areasOfPractice: [],
    districts: [],
    lawyerNames: [],
};

const CASE_AREA_LABELS: Record<string, string> = {
    Criminal: 'Criminal Law',
    Civil: 'Civil Law / Civil Disputes',
    Family: 'Family Law',
    Corporate: 'Business / Commercial Law',
    'Intellectual Property': 'Intellectual Property Law',
    Labour: 'Employment Law',
    'Land & Property': 'Property Law',
    Immigration: 'Immigration Law',
};

const EMPTY_FILTERS: SearchFilters = {
    caseArea: null,
    district: null,
    lawyerName: null,
};

interface DropdownProps {
    label: string;
    selected: DropdownItem | null;
    options: DropdownItem[];
    loading?: boolean;
    onSelect: (item: DropdownItem) => void;
    getOptionLabel?: (item: DropdownItem) => string;
}

const Dropdown: React.FC<DropdownProps> = ({
                                               label,
                                               selected,
                                               options,
                                               loading,
                                               onSelect,
                                               getOptionLabel = (item) => item.label,
                                           }) => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setVisible(true)}
                    activeOpacity={0.7}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#9E9E9E" style={{ flex: 1 }} />
                    ) : (
                        <Text style={[styles.dropdownValue, !selected && styles.dropdownPlaceholder]}>
                            {selected ? getOptionLabel(selected) : ''}
                        </Text>
                    )}
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
                                    key={String(option.value)}
                                    style={[
                                        styles.modalOption,
                                        selected?.value === option.value && styles.modalOptionSelected,
                                    ]}
                                    onPress={() => {
                                        onSelect(option);
                                        setVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.modalOptionText,
                                            selected?.value === option.value && styles.modalOptionTextSelected,
                                        ]}
                                    >
                                        {getOptionLabel(option)}
                                    </Text>
                                    {selected?.value === option.value && (
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

interface LawyerCardProps {
    lawyer: LawyerSearchResultDto;
    onPress?: (lawyer: LawyerSearchResultDto) => void;
}

const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer, onPress }) => {
    const imageUri = lawyer.profileImageBase64
        ? `data:image/jpeg;base64,${lawyer.profileImageBase64}`
        : null;

    const initials = lawyer.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <TouchableOpacity
            style={styles.lawyerCard}
            onPress={() => onPress?.(lawyer)}
            activeOpacity={0.75}
        >
            <View style={styles.lawyerAvatar}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitials}>{initials}</Text>
                    </View>
                )}
            </View>
            <View style={styles.lawyerInfo}>
                <Text style={styles.lawyerName}>{lawyer.fullName}</Text>
                <Text style={styles.lawyerSubText}>{lawyer.areaOfPractice}</Text>
                {lawyer.professionalDesignation ? (
                    <Text style={styles.lawyerDesignation}>{lawyer.professionalDesignation}</Text>
                ) : null}
            </View>
            <View style={styles.lawyerMeta}>
                <Text style={styles.lawyerExp}>{lawyer.yearOfExperience} yrs exp</Text>
                <Text style={styles.lawyerRating}>⭐ {lawyer.averageRating.toFixed(1)}</Text>
                <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verified</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

interface SearchLawyerScreenProps {
    navigation?: any;
    route?: any;
}

const SearchLawyer: React.FC<SearchLawyerScreenProps> = ({ navigation, route }) => {
    const presetCaseArea = route?.params?.presetCaseArea ?? null;

    const [dropdownOptions, setDropdownOptions] = useState<LawyerSearchDropdownsDto>(EMPTY_DROPDOWNS);
    const [dropdownsLoading, setDropdownsLoading] = useState(true);
    const [dropdownsError, setDropdownsError] = useState<string | null>(null);

    const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
    const [results, setResults] = useState<LawyerSearchResultDto[] | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const loadDropdowns = useCallback(async () => {
        setDropdownsLoading(true);
        setDropdownsError(null);

        try {
            const data = await LawyerSearchService.getDropdowns();
            setDropdownOptions(data);

            if (presetCaseArea) {
                const normalizedPreset = String(presetCaseArea).trim().toLowerCase();

                const preset = data.areasOfPractice.find((a) => {
                    const rawLabel = String(a.label).trim().toLowerCase();
                    const displayLabel = String(CASE_AREA_LABELS[a.label] ?? a.label).trim().toLowerCase();

                    return rawLabel === normalizedPreset || displayLabel === normalizedPreset;
                });

                if (preset) {
                    setFilters((f) => ({ ...f, caseArea: preset }));
                }
            }
        } catch (e: any) {
            console.error('loadDropdowns error:', e?.message);
            setDropdownsError('Failed to load filters. Please try again.');
        } finally {
            setDropdownsLoading(false);
        }
    }, [presetCaseArea]);

    useFocusEffect(
        useCallback(() => {
            setResults(null);
            setSearchError(null);
            setFilters(EMPTY_FILTERS);
            loadDropdowns();
        }, [loadDropdowns])
    );

    const handleSearch = async () => {
        setSearchLoading(true);
        setSearchError(null);

        try {
            const data = await LawyerSearchService.searchLawyers({
                areaOfPractice: filters.caseArea !== null ? Number(filters.caseArea.value) : undefined,
                district: filters.district !== null ? Number(filters.district.value) : undefined,
                nameSearch: filters.lawyerName !== null ? filters.lawyerName.label : undefined,
            });
            setResults(data);
        } catch (e: any) {
            console.error('searchLawyers error:', e?.message);
            setSearchError('Search failed. Please try again.');
            setResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleLawyerPress = (lawyer: LawyerSearchResultDto) => {
        navigation?.navigate('AppointmentRequest', { lawyerId: lawyer.lawyerId });
    };

    const isFormFilled =
        filters.caseArea !== null ||
        filters.district !== null ||
        filters.lawyerName !== null;

    const renderContent = () => {
        if (results !== null) {
            return (
                <>
                    {searchError && (
                        <View style={styles.errorBanner}>
                            <Text style={styles.errorBannerText}>{searchError}</Text>
                        </View>
                    )}
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.lawyerId}
                        renderItem={({ item }) => (
                            <LawyerCard lawyer={item} onPress={handleLawyerPress} />
                        )}
                        contentContainerStyle={styles.resultsList}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={
                            results.length > 0 ? (
                                <Text style={styles.resultsCount}>
                                    {results.length} lawyer{results.length !== 1 ? 's' : ''} found
                                </Text>
                            ) : null
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No lawyers found</Text>
                                <Text style={styles.emptyStateSubText}>
                                    Try adjusting your search filters
                                </Text>
                            </View>
                        }
                    />
                </>
            );
        }

        if (dropdownsError) {
            return (
                <View style={styles.errorState}>
                    <Text style={styles.errorStateText}>{dropdownsError}</Text>
                    <TouchableOpacity onPress={loadDropdowns} style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.formContainer}>
                <Dropdown
                    label="Case Area"
                    selected={filters.caseArea}
                    options={dropdownOptions.areasOfPractice}
                    loading={dropdownsLoading}
                    onSelect={(val) => setFilters((f) => ({ ...f, caseArea: val }))}
                    getOptionLabel={(item) => CASE_AREA_LABELS[item.label] ?? item.label}
                />
                <Dropdown
                    label="District"
                    selected={filters.district}
                    options={dropdownOptions.districts}
                    loading={dropdownsLoading}
                    onSelect={(val) => setFilters((f) => ({ ...f, district: val }))}
                />
                <Dropdown
                    label="Name"
                    selected={filters.lawyerName}
                    options={dropdownOptions.lawyerNames}
                    loading={dropdownsLoading}
                    onSelect={(val) => setFilters((f) => ({ ...f, lawyerName: val }))}
                />
            </View>
        );
    };

    return (
        <ClientLayout
            title="Search Lawyer"
            disableScroll
            onProfilePress={() => navigation.getParent()?.navigate('ClientProfile')}
        >
            <View style={styles.screen}>
                <View style={styles.body}>{renderContent()}</View>

                {results === null && !dropdownsError && (
                    <View style={styles.footer}>
                        <Button
                            title="SEARCH A LAWYER"
                            variant="primary"
                            onPress={handleSearch}
                            loading={searchLoading}
                            disabled={!isFormFilled || dropdownsLoading}
                            style={styles.searchButton}
                        />
                    </View>
                )}
            </View>
        </ClientLayout>
    );
};

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
    },
    resultsCount: {
        fontSize: 13,
        color: '#9E9E9E',
        marginBottom: 10,
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
    lawyerSubText: {
        fontSize: 12,
        color: '#9E9E9E',
    },
    lawyerDesignation: {
        fontSize: 11,
        color: '#BDBDBD',
        marginTop: 2,
    },
    lawyerMeta: {
        alignItems: 'flex-end',
        gap: 4,
    },
    lawyerExp: {
        fontSize: 11,
        color: '#9E9E9E',
        marginBottom: 2,
    },
    lawyerRating: {
        fontSize: 12,
        color: '#F9A825',
        fontWeight: '600',
        marginBottom: 4,
    },
    verifiedBadge: {
        backgroundColor: '#E8F5E9',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    verifiedText: {
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
    errorBanner: {
        marginHorizontal: spacing.lg ?? 20,
        marginTop: 10,
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
        padding: 12,
    },
    errorBannerText: {
        color: '#C62828',
        fontSize: 13,
        textAlign: 'center',
    },
    errorState: {
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    errorStateText: {
        color: '#C62828',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#5B4BDB',
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    retryText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default SearchLawyer;