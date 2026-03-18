import apiClient from "../api/client";
import { ENDPOINTS } from "../config/api.config";

export class KnowledgeHubService {

  static async getAllArticles() {
    const response = await apiClient.get(ENDPOINTS.KNOWLEDGE_HUB.GET_ALL);

    return response.data.map((a: any) => ({
      id: String(a.articleId),
      title: a.title,
      author: a.lawyerId,
      date: new Date(a.createdAt).toLocaleDateString(),
      content: a.content,
      isLiked: false,
      likeCount: a.likeCount ?? 0
    }));
  }

  static async createArticle(article: any, token: string) {
    const response = await apiClient.post(
      ENDPOINTS.KNOWLEDGE_HUB.CREATE,
      article,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  }

  static async updateArticle(id: number, article: any, token: string) {
    const response = await apiClient.put(
      ENDPOINTS.KNOWLEDGE_HUB.UPDATE(id),
      article,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  }

  static async deleteArticle(id: number) {
    const response = await apiClient.delete(
      ENDPOINTS.KNOWLEDGE_HUB.DELETE(id),
      {
        headers: {
          // Authorization header can be added here if required by backend
        }
      }
    );

    return response.data;
  }
}