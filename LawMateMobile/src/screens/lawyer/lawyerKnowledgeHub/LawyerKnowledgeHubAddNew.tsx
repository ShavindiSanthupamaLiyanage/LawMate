import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import Input from '../../../components/Input';
import { useNavigation } from '@react-navigation/native';
import InitialTopNavbar from '../../../components/InitialTopNavbar';
import ScreenWrapper from '../../../components/ScreenWrapper';

const AddNewArticle: React.FC = () => {
  const navigation = useNavigation<any>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handlePublish = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    console.log('Saved Article:', { title, content });
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };


  return (
    <ScreenWrapper backgroundColor={colors.background} edges={["top"]}>
      <View style={styles.page}>
        <InitialTopNavbar
          title="Add New Article"
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

      
          {/* Cancel and Publish Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.publishBtn}
              onPress={handlePublish}
            >
              <Text style={styles.publishText}>Publish</Text>
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

  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: spacing.md,
borderRadius: 999,
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  cancelText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
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
    fontWeight: fontWeight.semibold,
  },

  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

export default AddNewArticle;