import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../config/theme';
import SearchBar from '../../../components/SearchBar';
import ClientLayout from '../../../components/ClientLayout';
import {useNavigation} from "@react-navigation/native";

interface Article {
  id: string;
  header: string;
  author: string;
  date: string;
  content: string;
  isLiked: boolean;
  likeCount: number;
}

const ArticlePost: React.FC<{
  article: Article;
  onLike: (id: string) => void
}> = ({ article, onLike }) => {
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
      </View>

      <Text style={styles.articleHeader}>{article.header}</Text>
      <Text style={styles.postContent}>{article.content}</Text>

      <View style={styles.divider} />

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => onLike(article.id)}
        >
          <Text style={[
            styles.actionIcon,
            { color: article.isLiked ? colors.primary : colors.primary + '60' }
          ]}>
            👍
          </Text>
          <Text style={[
            styles.actionText,
            { color: article.isLiked ? colors.primary : colors.textSecondary }
          ]}>
            {article.likeCount} Likes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const KnowledgeHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'recent'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([
    { id: '1', header: 'Law category Identification', author: 'Attiya Silva', date: 'Oct 5, 2024', content: "Understanding property law is essential when buying, selling, leasing, or inheriting land and buildings. It defines ownership rights, transfer procedures, land registration requirements, and dispute resolution methods. In Sri Lanka, property ownership is governed by title registration, deeds, and local authority approvals. Individuals must verify clear titles, zoning regulations, and tax obligations before transactions. Legal remedies exist for boundary disputes, unlawful occupation, and inheritance conflicts, making professional legal guidance crucial.", isLiked: false, likeCount: 12 },
    { id: '2', header: 'Law category Identification', author: 'John Doe', date: 'Oct 4, 2024', content: "Family law governs legal relationships within families, including marriage, divorce, child custody, maintenance, and domestic rights. It ensures the protection of spouses and children while defining responsibilities and legal procedures during separation or disputes. Courts prioritize the best interests of the child in custody decisions and may order financial support where necessary. Understanding legal rights, mediation options, and documentation requirements helps families resolve conflicts respectfully and lawfully.", isLiked: true, likeCount: 7 },
    { id: '3', header: 'Law category Identification', author: 'Jane Smith', date: 'Oct 3, 2024', content: "Recent labour law amendments focus on improving employee rights, workplace safety, and fair compensation practices. Employers must comply with regulations on working hours, overtime payments, leave entitlements, and termination procedures. The law protects workers from discrimination, unsafe conditions, and unjust dismissal while encouraging fair dispute resolution through labour tribunals. Both employers and employees benefit from understanding these regulations to maintain a productive and legally compliant work environment.", isLiked: false, likeCount: 4 },
    { id: '4', header: 'Law category Identification', author: 'John Doe', date: 'Oct 4, 2024', content: "Contract law forms the foundation of business and personal agreements by ensuring that promises made between parties are legally enforceable. A valid contract requires offer, acceptance, consideration, and mutual intent. Written agreements help prevent misunderstandings and provide clarity regarding obligations, deadlines, and penalties for breach. When disputes arise, legal remedies such as compensation or contract enforcement may be pursued. Understanding contract terms before signing helps individuals avoid costly legal complications.", isLiked: false, likeCount: 3 }
  ]);

  const navigation = useNavigation<any>();

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

  const filteredArticles = articles.filter(art =>
    art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ClientLayout userName="Knowledge Hub"
                  onProfilePress={() => navigation.navigate('ClientProfile')}
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
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Articles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'recent' && styles.activeTabButton]}
            onPress={() => setActiveTab('recent')}
          >
            <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>Recent Articles</Text>
          </TouchableOpacity>
        </View>

        {filteredArticles.map(article => (
          <ArticlePost key={article.id} article={article} onLike={toggleLike} />
        ))}
      </View>
    </ClientLayout>
  );
};

const styles = StyleSheet.create({
  contentWrapper: {
    paddingHorizontal:
      spacing.lg,
    paddingTop:
      spacing.xl
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    height: 48,
    marginBottom: spacing.lg,
  },

  tabsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },

  tabButton: {
    flex: 1,
    height: 42,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeTabButton: {
    backgroundColor:
      colors.primary
  },

  tabText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary
  },

  activeTabText: {
    color: colors.white
  },

  postCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },

  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E5DBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },

  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  headerInfo: {
    flex: 1,
  },

  authorName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },

  postDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },

  postContent: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: -spacing.md,
    marginBottom: spacing.xs,
  },

  actionContainer: {
    flexDirection: 'row',
    paddingTop: spacing.xs,
  },

  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.xl,
    paddingVertical: spacing.xs,
  },

  actionIcon: {
    fontSize: 18,
    marginRight: spacing.xs,
  },

  actionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },

  articleHeader: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: '#2906ed',
    marginBottom: spacing.xs,
  },

  SearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    height: 48,
    marginBottom: spacing.lg,

    marginHorizontal: -spacing.lg, // cancels parent padding
    paddingHorizontal: spacing.lg, // keeps inner text padding
  },
});

export default KnowledgeHub;