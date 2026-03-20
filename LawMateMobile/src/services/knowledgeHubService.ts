import apiClient from "../api/httpClient";
import { ENDPOINTS } from "../config/api.config";
import { StorageService } from "../utils/storage";
import { UserDetailService } from "./userDetailService";

const authHeader = async () => {
  const token = await StorageService.getToken();
  return { Authorization: `Bearer ${token}` };
};

const resolveAuthorName = async (lawyerId: string): Promise<string> => {
  try {
    const user = await UserDetailService.getUserById(lawyerId);
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email ?? lawyerId;
  } catch {
    return lawyerId;
  }
};

const mapArticle = (a: any, authorName: string) => ({
  id: String(a.articleId),
  title: a.title,
  author: authorName,
  date: new Date(a.createdAt).toLocaleDateString(),
  content: a.content,
  isLiked: false,
  likeCount: a.likeCount ?? 0,
});

export class KnowledgeHubService {

  static async getAllArticles() {
    const response = await apiClient.get(ENDPOINTS.KNOWLEDGE_HUB.GET_ALL);

    // Resolve all author names in parallel
    const articles = await Promise.all(
      response.data.map(async (a: any) => {
        const authorName = await resolveAuthorName(a.lawyerId);
        return mapArticle(a, authorName);
      })
    );

    return articles;
  }

  static async getArticlesByLawyer(lawyerId: string) {
    const headers = await authHeader();
    const response = await apiClient.get(
      ENDPOINTS.KNOWLEDGE_HUB.GET_BY_LAWYER(lawyerId),
      { headers }
    );

    // All articles belong to same lawyer — resolve name once
    const authorName = await resolveAuthorName(lawyerId);

    return response.data.map((a: any) => mapArticle(a, authorName));
  }

  static async createArticle(article: { title: string; content: string }) {
    const headers = await authHeader();
    const response = await apiClient.post(
      ENDPOINTS.KNOWLEDGE_HUB.CREATE,
      article,
      { headers }
    );
    return response.data;
  }

  static async updateArticle(id: number, article: { title: string; content: string }) {
    const headers = await authHeader();

    const userData = await StorageService.getUserData();
    const lawyerId = userData?.userId ?? "";

    const payload = {
      title: article.title,
      content: article.content,
      lawyerId: lawyerId,
      lawyerName: "",
      createdBy: "",
      modifiedBy: lawyerId,
      // legalCategory: 0,         // 0 = default/None enum value
      // language: 0,              // 0 = default/None enum value
      isPublished: true,
      likeCount: 0,
    };

    const response = await apiClient.put(
      ENDPOINTS.KNOWLEDGE_HUB.UPDATE(id),
      payload,
      { headers }
    );
    return response.data;
  }

  static async deleteArticle(id: number) {
    const headers = await authHeader();
    const response = await apiClient.delete(
      ENDPOINTS.KNOWLEDGE_HUB.DELETE(id),
      { headers }
    );
    return response.data;
  }

 
  static async getRecentArticles() {
    const response = await apiClient.get(ENDPOINTS.KNOWLEDGE_HUB.RECENT); 

    const articles = await Promise.all(
      response.data.map(async (a: any) => {
        const authorName = await resolveAuthorName(a.lawyerId);
        return mapArticle(a, authorName);
      })
    );

    return articles;
  }
}