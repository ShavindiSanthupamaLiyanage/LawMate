import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import SearchBar from '../../../components/SearchBar';
import ClientLayout from '../../../components/ClientLayout';
import { useNavigation } from "@react-navigation/native";
import { KnowledgeHubService } from "../../../services/knowledgeHubService";

interface Article {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  isLiked: boolean;
  likeCount: number;
}

const ArticlePost: React.FC<{ article: Article; onLike: (id: string) => void }> = ({ article, onLike }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{article.author.charAt(0)}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.authorName}>{article.author}</Text>
        <Text style={styles.postDate}>{article.date}</Text>
      </View>
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

const KnowledgeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchArticles('all'); // initial load
  }, []);

  const fetchArticles = async (tab: 'all' | 'recent') => {
    try {
      let data: Article[] = [];
      if (tab === 'recent') {
        data = await KnowledgeHubService.getRecentArticles();
      } else {
        data = await KnowledgeHubService.getAllArticles();
      }
      setArticles(data);
    } catch (error) {
      console.log("Error fetching articles", error);
    }
  };

  const onTabPress = (tab: 'all' | 'recent') => {
    setActiveTab(tab);
    fetchArticles(tab);
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

  const filteredArticles = articles.filter(
    art =>
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ClientLayout
      title="Knowledge Hub"
      onProfilePress={() => navigation.getParent()?.navigate("ClientProfile")}
    >
      <View style={styles.contentWrapper}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search name..."
            onSearch={() => console.log('Searching for:', searchQuery)}
            onClear={() => console.log('Search cleared')}
          />
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'all' && styles.activeTabButton]}
            onPress={() => onTabPress('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Articles</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'recent' && styles.activeTabButton]}
            onPress={() => onTabPress('recent')}
          >
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>Recent Articles</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <ArticlePost key={article.id} article={article} onLike={toggleLike} />
            ))
          ) : (
            <Text style={{ textAlign: 'center', marginTop: spacing.lg }}>No articles found</Text>
          )}
        </ScrollView>
      </View>
    </ClientLayout>
  );
};

const styles = StyleSheet.create({
  contentWrapper: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, height: 48, marginBottom: spacing.lg },
  tabsContainer: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  tabButton: { flex: 1, height: 42, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
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
  actionContainer: { flexDirection: 'row', paddingTop: spacing.xs },
  likeButton: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.xl, paddingVertical: spacing.xs },
  actionIcon: { fontSize: 18, marginRight: spacing.xs },
  actionText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  articleHeader: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.xs },
});

export default KnowledgeHub;