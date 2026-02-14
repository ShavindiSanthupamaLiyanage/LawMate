import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../config/theme';

interface TabIconProps {
    iconName: keyof typeof Ionicons.glyphMap;
    color: string;
    focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ iconName, color, focused }) => {
    return (
        <View
            style={{
                width: focused ? 56 : 40,
                height: focused ? 56 : 40,
                borderRadius: focused ? 28 : 20,
                backgroundColor: focused ? colors.primary : 'transparent',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: focused ? -20 : 0,
                shadowColor: focused ? colors.primary : 'transparent',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: focused ? 0.3 : 0,
                shadowRadius: 8,
                elevation: focused ? 5 : 0,
            }}
        >
            <Ionicons
                name={iconName}
                size={focused ? 28 : 24}
                color={focused ? colors.white : color}
            />
        </View>
    );
};

export default TabIcon;
