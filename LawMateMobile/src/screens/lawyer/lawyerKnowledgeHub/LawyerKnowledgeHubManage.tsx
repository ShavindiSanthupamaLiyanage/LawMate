import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Input from '../../../components/Input';
import { useNavigation, useRoute } from '@react-navigation/native';
import InitialTopNavbar from '../../../components/InitialTopNavbar';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Toast from '../../../components/Toast';
import { KnowledgeHubService } from "../../../services/knowledgeHubService";

const ManageArticle: React.FC = () => {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { article } = route.params;

  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [showToast, setShowToast] = useState(false);

  const handleupdate = async () => {

    if (!title.trim() || !content.trim()) {
      Alert.alert("Validation", "Please fill all fields");
      return;
    }

    try {

      await KnowledgeHubService.updateArticle(article.id, {
        title,
        content
      });

      setShowToast(true);

      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      Alert.alert("Error", "Failed to update article");
    }

  };

  return (
    <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>

      <Toast
        visible={showToast}
        message="You have successfully updated the article"
        type="success"
        onDismiss={() => setShowToast(false)}
      />

      <View style={styles.page}>
        <InitialTopNavbar
          title="Manage Article"
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
            style={styles.updateBtn}
            onPress={handleupdate}
          >
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },

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

  uploadWrapper: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },

  updateBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 999,
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  updateText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },

  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default ManageArticle;