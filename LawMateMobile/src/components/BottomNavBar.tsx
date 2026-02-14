import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';

interface TabIconProps {
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    focused: boolean;
    isHome?: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ iconName, color, focused, isHome = false }) => {
    return (
        <View
            style={{
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <View
                style={{
                    width: isHome ? 56 : 0,
                    height: isHome ? 56 : 0,
                    borderRadius: isHome ? 28 : 0,
                    backgroundColor: isHome ? (focused ? colors.primary : '#E8E8E8') : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'absolute',
                    shadowColor: isHome && focused ? colors.primary : 'transparent',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isHome && focused ? 0.3 : 0,
                    shadowRadius: 8,
                    elevation: isHome && focused ? 5 : 0,
                }}
            />
            <Ionicons
                name={iconName}
                size={isHome ? (focused ? 32 : 28) : focused ? 28 : 24}
                color={isHome && focused ? colors.white : focused ? colors.primary : color}
            />
        </View>
    );
};

export default TabIcon;
