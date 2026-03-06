import React, {useState} from "react";
import { TouchableOpacity, View, Text, StyleSheet, Image } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
    colors,
    spacing,
    borderRadius,
    fontSize, fontWeight,
} from "../config/theme";

interface UploadCardProps {
    title: string;
    fileName?: string;
    uri?: string;
    onPress: () => void;
    fullWidth?: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({
                                                   title,
                                                   fileName,
                                                   uri,
                                                   onPress,
                                                   fullWidth,
                                               }) => {

    const [showTitle, setShowTitle] = useState(false);

    return (
        <TouchableOpacity
            style={[
                styles.card,
                fullWidth && styles.fullWidth,
                uri && { padding: 0 }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            onLongPress={() => setShowTitle(true)}
            onPressOut={() => setShowTitle(false)}
        >
            {fileName && (fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i) || uri) ? (
                <>
                    <Image
                        source={{ uri: uri }}
                        style={styles.previewImage}
                        resizeMode="cover"
                    />
                    <View style={styles.fileNameOverlay}>
                        <Text style={styles.fileNameText} numberOfLines={1}>
                            {fileName}
                        </Text>
                    </View>
                    {showTitle && (
                        <View style={styles.titleOverlay}>
                            <Text style={styles.fileNameText} numberOfLines={2}>
                                {title}
                            </Text>
                        </View>
                    )}
                </>
            ) : (
                <>
                    <View style={styles.iconContainer}>
                        <Ionicons name="document-outline" size={22} color={colors.primary} />
                    </View>
                    <Text style={styles.title} numberOfLines={2}>
                        {fileName ? fileName : title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
};

export default UploadCard;

const styles = StyleSheet.create({
    card: {
        flex: 1,
        backgroundColor: "#F2F1FF",
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        alignItems: "center",
        justifyContent: "center",
        margin: spacing.sm,
        minHeight: 120,
    },

    fullWidth: {
        flex: 0,
        width: "100%",
    },

    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: spacing.sm,
    },

    title: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textPrimary,
        textAlign: "center",
    },

    previewImage: {
        width: "100%",
        height: "100%",
        borderRadius: borderRadius.lg,
        position: "absolute",
        top: 0,
        left: 0,
    },
    fileNameOverlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0,0,0,0.45)",
        paddingVertical: 4,
        paddingHorizontal: 6,
        borderBottomLeftRadius: borderRadius.lg,
        borderBottomRightRadius: borderRadius.lg,
    },

    fileNameText: {
        fontSize: fontSize.xs,
        color: colors.white,
        textAlign: "center",
        fontWeight: fontWeight.medium,
    },
    titleOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.sm,
    },
});
