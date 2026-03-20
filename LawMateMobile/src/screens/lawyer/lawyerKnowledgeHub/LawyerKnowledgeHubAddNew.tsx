import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Input from '../../../components/Input';
import { useNavigation } from '@react-navigation/native';
import { KnowledgeHubService } from "../../../services/knowledgeHubService";
import { useToast } from '../../../context/ToastContext';
import InitialTopNavbar from '../../../components/InitialTopNavbar';
import ScreenWrapper from '../../../components/ScreenWrapper';

const AddNewArticle: React.FC = () => {
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      showError("Please fill all fields");
      return;
    }
    setLoading(true);

    try {
      await KnowledgeHubService.createArticle({ title, content }); // only once
      showSuccess("Article published successfully!");
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      console.log("Create Article Error:", error?.response?.data);
      showError("Failed to create article");
    } finally {
      setLoading(false);
    }
  };

 return (
  <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>

    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <InitialTopNavbar
        title="Add New Article "
        onBack={() => navigation.goBack()}
        showLogo={false}
      />
    </View>

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