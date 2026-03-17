import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Input from '../../../components/Input';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Toast from '../../../components/Toast';
import { KnowledgeHubService } from "../../../services/knowledgeHubService";

const AddNewArticle: React.FC = () => {
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      setToastMessage("Please fill all fields");
      setToastType("error");
      setToastVisible(true);
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setToastMessage("You are not logged in. Please login first.");
        setToastType("error");
        setToastVisible(true);
        setLoading(false);
        return;
      }

      await KnowledgeHubService.createArticle({ title, content }, token);

      setToastMessage("Article published successfully!");
      setToastType("success");
      setToastVisible(true);

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error: any) {
      console.log("Create Article Error:", error?.response?.data);
      console.log("Status:", error?.response?.status);
      console.log("Headers:", error?.config?.headers);

      setToastMessage("Failed to create article");
      setToastType("error");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Input
          label="Article Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Enter article title"
        />

        <Input
          label="Article Content"
          value={content}
          onChangeText={setContent}
          placeholder="Enter article content"
          multiline
          style={styles.textArea}
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.publishBtn, loading && { opacity: 0.6 }]}
            onPress={handlePublish}
            disabled={loading}
          >
            <Text style={styles.publishText}>
              {loading ? "Publishing..." : "Publish"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: spacing.lg },

  textArea: {
    height: 340,
    width: '100%',
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    marginBottom: spacing.lg,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md
  },

  publishBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  publishText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold
  },
});

export default AddNewArticle;