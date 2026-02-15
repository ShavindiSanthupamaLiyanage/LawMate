import React from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../config/theme';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onSearch?: () => void;
    onClear?: () => void;
    style?: ViewStyle;
    autoFocus?: boolean;
    editable?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
                                                 value,
                                                 onChangeText,
                                                 placeholder = 'Search...',
                                                 onSearch,
                                                 onClear,
                                                 style,
                                                 autoFocus = false,
                                                 editable = true,
                                             }) => {
    const handleClear = () => {
        onChangeText('');
        if (onClear) {
            onClear();
        }
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch();
        }
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.searchContainer}>
                {/* Search Icon */}
                <TouchableOpacity
                    onPress={handleSearch}
                    style={styles.iconButton}
                    disabled={!onSearch}
                >
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={colors.textSecondary}
                    />
                </TouchableOpacity>

                {/* Text Input */}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    autoFocus={autoFocus}
                    editable={editable}
                    returnKeyType="search"
                    onSubmitEditing={handleSearch}
                />

                {/* Clear Button */}
                {value.length > 0 && (
                    <TouchableOpacity
                        onPress={handleClear}
                        style={styles.iconButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    iconButton: {
        padding: spacing.xs,
    },
    input: {
        flex: 1,
        fontSize: fontSize.md,
        color: colors.textPrimary,
        paddingHorizontal: spacing.sm,
        paddingVertical: 0,
        height: 24,
    },
});

export default SearchBar;