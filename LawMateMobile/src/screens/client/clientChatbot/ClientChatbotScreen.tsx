import React, { useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import ClientLayout from "../../../components/ClientLayout";
import { colors, spacing, fontSize, fontWeight } from "../../../config/theme";

type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
};

const ClientChatbotScreen: React.FC = () => {
    const navigation = useNavigation<any>();

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const listRef = useRef<FlatList<ChatMessage>>(null);

    const onSend = () => {
        const text = input.trim();
        if (!text) return;

        const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", text };
        const botMsg: ChatMessage = {
            id: `${Date.now()}-a`,
            role: "assistant",
            text: "Got it ✅ (backend will be connected later)",
        };

        setMessages((prev) => [...prev, userMsg, botMsg]);
        setInput("");

        requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isUser = item.role === "user";
        return (
            <View style={[styles.bubbleRow, { justifyContent: isUser ? "flex-end" : "flex-start" }]}>
                <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
                    <Text style={[styles.bubbleText, isUser && { color: colors.white }]}>{item.text}</Text>
                </View>
            </View>
        );
    };

    return (
        <ClientLayout
            title="Chat with Lawly"
            userName="Kavindi Gimsara"
            disableScroll
            showBackButton
            onBackPress={() => navigation.goBack()}
        >
            <KeyboardAvoidingView
                style={styles.root}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={0}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(m) => m.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={[
                        styles.listContent,
                        { flexGrow: messages.length === 0 ? 1 : 0 },
                    ]}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyTitle}>Chatbot</Text>
                            <Text style={styles.emptySub}>Ask questions and get guidance from Lawly.</Text>
                        </View>
                    }
                />

                <View style={styles.composerContainer}>
                    <TouchableOpacity style={styles.plusBtn} activeOpacity={0.85}>
                        <Ionicons name="add" size={22} color={colors.primary} />
                    </TouchableOpacity>

                    <View style={styles.inputWrap}>
                        <TextInput
                            value={input}
                            onChangeText={setInput}
                            placeholder="Send a message"
                            placeholderTextColor={colors.textSecondary}
                            style={styles.input}
                            returnKeyType="send"
                            onSubmitEditing={onSend}
                        />

                        <TouchableOpacity onPress={onSend} style={styles.sendBtn} activeOpacity={0.85}>
                            <Ionicons name="send" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ClientLayout>
    );
};

const styles = StyleSheet.create({
    root: { flex: 1 },

    listContent: {
        paddingTop: spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },

    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    emptySub: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textAlign: "center",
        lineHeight: 20,
    },

    bubbleRow: { flexDirection: "row", width: "100%" },
    bubble: {
        maxWidth: "80%",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 16,
    },
    userBubble: { backgroundColor: colors.primary, borderTopRightRadius: 6 },
    botBubble: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.borderLight,
        borderTopLeftRadius: 6,
    },
    bubbleText: { fontSize: fontSize.sm, color: colors.textPrimary, lineHeight: 20 },

    composerContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
    },
    plusBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.white,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.borderLight,
    },
    inputWrap: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.borderLight,
        paddingLeft: spacing.md,
        paddingRight: spacing.sm,
        height: 44,
    },
    input: {
        flex: 1,
        fontSize: fontSize.sm,
        color: colors.textPrimary,
        paddingVertical: 0,
    },
    sendBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ClientChatbotScreen;