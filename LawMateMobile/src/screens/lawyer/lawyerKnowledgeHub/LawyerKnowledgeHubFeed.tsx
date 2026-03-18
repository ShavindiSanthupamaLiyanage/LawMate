import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import SearchBar from '../../../components/SearchBar';
import LawyerLayout from '../../../components/LawyerLayout';
import { useNavigation } from "@react-navigation/native";
import Button from '../../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../../../context/ToastContext';
import { KnowledgeHubService } from "../../../services/knowledgeHubService";
import { StorageService } from "../../../utils/storage";

interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  isLiked: boolean;
  likeCount: number;
}

const ArticlePost: React.FC<{
  article: Article;
  onLike: (id: string) => void;
  showEdit?: boolean;
  onEdit?: (article: Article) => void;
  onDelete?: (id: string) => void;
}> = ({ article, onLike, showEdit, onEdit, onDelete }) => {
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{article.author.charAt(0)}</Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.authorName}>{article.author}</Text>
          <Text style={styles.postDate}>{article.date}</Text>
        </View>

        {showEdit && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.editButton}
              activeOpacity={0.85}
              onPress={() => onEdit?.(article)}
            >
              <Ionicons name="create" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.85}
              onPress={() => onDelete?.(article.id)}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.articleHeader}>{article.title}</Text>
      <Text style={styles.postContent}>{article.content}</Text>

      <View style={styles.divider} />

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.likeButton} onPress={() => onLike(article.id)}>
          <Text style={[styles.actionIcon, { color: article.isLiked ? colors.primary : colors.primary + '60' }]}>👍</Text>
          <Text style={[styles.actionText, { color: article.isLiked ? colors.primary : colors.textSecondary }]}>
            {article.likeCount} Likes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const LawyerKnowledgeHubFeed: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { showSuccess } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [lawyerId, setLawyerId] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await StorageService.getUserData();
      if (userData?.userId) {
        setLawyerId(userData.userId);
      }
    };
    loadUser();
    fetchArticles();
  }, []);

  const fetchArticles = async (tab: 'all' | 'recent' = 'all') => {
    try {
      let data;
      if (tab === 'recent' && lawyerId) {
        data = await KnowledgeHubService.getArticlesByLawyer(lawyerId);
      } else {
        data = await KnowledgeHubService.getAllArticles();
      }
      setArticles(data);
    } catch (error) {
      console.log("Error fetching articles", error);
    }
  };

  const toggleLike = (id: string) => {
    setArticles(prev =>
      prev.map(art => {
        if (art.id === id) {
          const isNowLiked = !art.isLiked;
          return { ...art, isLiked: isNowLiked, likeCount: art.likeCount + (isNowLiked ? 1 : -1) };
        }
        return art;
      })
    );
  };

 const handleDelete = async (id: string) => {
  try {
    // Convert string id to number before sending to backend
    const articleId = Number(id);
    if (isNaN(articleId)) {
      console.log("Invalid article ID:", id);
      return;
    }

    await KnowledgeHubService.deleteArticle(articleId);
    setArticles(prev => prev.filter(article => article.id !== id));
    showSuccess("You have successfully deleted the article.");

  } catch (error) {
    console.log("Delete failed", error);
  }
};

  const filteredArticles = articles.filter(art =>
    art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LawyerLayout
      title="Knowledge Hub"
      userName="Kavindu Gimsara"
      onProfilePress={() => navigation.getParent()?.navigate("LawyerProfile")}
    >
      <ScrollView contentContainerStyle={styles.contentWrapper}>
        <View style={styles.topRow}>
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search name..."
              onSearch={() => console.log('Searching for:', searchQuery)}
              onClear={() => console.log('Search cleared')}
            />
          </View>

          <Button
            title="+"
            variant="primary"
            onPress={() => navigation.navigate("AddNewArticle")}
            style={styles.addIconButton}
            textStyle={styles.addIconText}
          />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.activeTabButton]}
            onPress={() => { setActiveTab('all'); fetchArticles('all'); }}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
              All Articles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'recent' && styles.activeTabButton]}
            onPress={() => { setActiveTab('recent'); fetchArticles('recent'); }}
          >
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
              My Articles
            </Text>
          </TouchableOpacity>
        </View>

        {filteredArticles.map(article => (
          <ArticlePost
            key={article.id}
            article={article}
            onLike={toggleLike}
            showEdit={activeTab === 'recent'}
            onEdit={(art) => navigation.navigate('ManageArticle', { article: art })}
            onDelete={handleDelete}
          />
        ))}
      </ScrollView>
    </LawyerLayout>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  searchWrapper: { flex: 1 },
  addIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: spacing.sm,
    paddingHorizontal: 0,
    alignSelf: "center",
  },
  addIconText: { fontSize: 26, marginTop: -2 },
  tabsContainer: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  tabButton: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: { backgroundColor: colors.gradient },
  tabText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.primaryLight },
  activeTabText: { color: colors.primary },
  postCard: { backgroundColor: colors.white, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md, elevation: 3 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: colors.gradient, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.primary },
  headerInfo: { flex: 1 },
  authorName: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.textPrimary },
  postDate: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  postContent: { fontSize: fontSize.md, color: colors.textPrimary, lineHeight: 22, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: spacing.xs },
  actionContainer: { flexDirection: 'row' },
  likeButton: { flexDirection: 'row', alignItems: 'center' },
  actionIcon: { fontSize: 18, marginRight: spacing.xs },
  actionText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  articleHeader: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.xs },
  actionButtons: { flexDirection: 'row', gap: 8 },
  editButton: { width: 40, height: 40, borderRadius: 33, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  deleteButton: { width: 40, height: 40, borderRadius: 33, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
});

export default LawyerKnowledgeHubFeed;