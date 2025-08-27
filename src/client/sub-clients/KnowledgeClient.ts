import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import {
  // Knowledge base
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  // Articles
  ArticleAttachments,
  ArticleConfigurationItemCategoryAssociations,
  ArticleNotes,
  ArticlePlainTextContent,
  ArticleTagAssociations,
  ArticleTicketAssociations,
  ArticleToArticleAssociations,
  ArticleToDocumentAssociations,
  // Documents
  Documents,
  DocumentAttachments,
  DocumentCategories,
  DocumentChecklistItems,
  DocumentChecklistLibraries,
  DocumentConfigurationItemAssociations,
  DocumentConfigurationItemCategoryAssociations,
  DocumentNotes,
  DocumentTagAssociations,
  DocumentTicketAssociations,
  DocumentToArticleAssociations,
  // Checklists
  ChecklistLibraries,
  ChecklistLibraryChecklistItems,
  // Tags
  Tags,
  TagGroups,
  TagAliases,
  // Attachment info
  AttachmentInfo,
} from '../../entities';

/**
 * KnowledgeClient handles all knowledge base and documentation entities:
 * - Knowledge base articles and categories
 * - Document management and organization
 * - Checklists and templates
 * - Tagging and classification
 * - Cross-references and associations
 */
export class KnowledgeClient extends BaseSubClient {
  // Knowledge base
  public readonly knowledgeBaseArticles: KnowledgeBaseArticles;
  public readonly knowledgeBaseCategories: KnowledgeBaseCategories;

  // Articles
  public readonly articleAttachments: ArticleAttachments;
  public readonly articleConfigurationItemCategoryAssociations: ArticleConfigurationItemCategoryAssociations;
  public readonly articleNotes: ArticleNotes;
  public readonly articlePlainTextContent: ArticlePlainTextContent;
  public readonly articleTagAssociations: ArticleTagAssociations;
  public readonly articleTicketAssociations: ArticleTicketAssociations;
  public readonly articleToArticleAssociations: ArticleToArticleAssociations;
  public readonly articleToDocumentAssociations: ArticleToDocumentAssociations;

  // Documents
  public readonly documents: Documents;
  public readonly documentAttachments: DocumentAttachments;
  public readonly documentCategories: DocumentCategories;
  public readonly documentChecklistItems: DocumentChecklistItems;
  public readonly documentChecklistLibraries: DocumentChecklistLibraries;
  public readonly documentConfigurationItemAssociations: DocumentConfigurationItemAssociations;
  public readonly documentConfigurationItemCategoryAssociations: DocumentConfigurationItemCategoryAssociations;
  public readonly documentNotes: DocumentNotes;
  public readonly documentTagAssociations: DocumentTagAssociations;
  public readonly documentTicketAssociations: DocumentTicketAssociations;
  public readonly documentToArticleAssociations: DocumentToArticleAssociations;

  // Checklists
  public readonly checklistLibraries: ChecklistLibraries;
  public readonly checklistLibraryChecklistItems: ChecklistLibraryChecklistItems;

  // Tags
  public readonly tags: Tags;
  public readonly tagGroups: TagGroups;
  public readonly tagAliases: TagAliases;

  // Attachment info
  public readonly attachmentInfo: AttachmentInfo;

  constructor(axios: AxiosInstance, logger: winston.Logger) {
    super(axios, logger, 'KnowledgeClient');

    // Knowledge base
    this.knowledgeBaseArticles = new KnowledgeBaseArticles(this.axios, this.logger);
    this.knowledgeBaseCategories = new KnowledgeBaseCategories(this.axios, this.logger);

    // Articles
    this.articleAttachments = new ArticleAttachments(this.axios, this.logger);
    this.articleConfigurationItemCategoryAssociations = new ArticleConfigurationItemCategoryAssociations(this.axios, this.logger);
    this.articleNotes = new ArticleNotes(this.axios, this.logger);
    this.articlePlainTextContent = new ArticlePlainTextContent(this.axios, this.logger);
    this.articleTagAssociations = new ArticleTagAssociations(this.axios, this.logger);
    this.articleTicketAssociations = new ArticleTicketAssociations(this.axios, this.logger);
    this.articleToArticleAssociations = new ArticleToArticleAssociations(this.axios, this.logger);
    this.articleToDocumentAssociations = new ArticleToDocumentAssociations(this.axios, this.logger);

    // Documents
    this.documents = new Documents(this.axios, this.logger);
    this.documentAttachments = new DocumentAttachments(this.axios, this.logger);
    this.documentCategories = new DocumentCategories(this.axios, this.logger);
    this.documentChecklistItems = new DocumentChecklistItems(this.axios, this.logger);
    this.documentChecklistLibraries = new DocumentChecklistLibraries(this.axios, this.logger);
    this.documentConfigurationItemAssociations = new DocumentConfigurationItemAssociations(this.axios, this.logger);
    this.documentConfigurationItemCategoryAssociations = new DocumentConfigurationItemCategoryAssociations(this.axios, this.logger);
    this.documentNotes = new DocumentNotes(this.axios, this.logger);
    this.documentTagAssociations = new DocumentTagAssociations(this.axios, this.logger);
    this.documentTicketAssociations = new DocumentTicketAssociations(this.axios, this.logger);
    this.documentToArticleAssociations = new DocumentToArticleAssociations(this.axios, this.logger);

    // Checklists
    this.checklistLibraries = new ChecklistLibraries(this.axios, this.logger);
    this.checklistLibraryChecklistItems = new ChecklistLibraryChecklistItems(this.axios, this.logger);

    // Tags
    this.tags = new Tags(this.axios, this.logger);
    this.tagGroups = new TagGroups(this.axios, this.logger);
    this.tagAliases = new TagAliases(this.axios, this.logger);

    // Attachment info
    this.attachmentInfo = new AttachmentInfo(this.axios, this.logger);
  }

  getName(): string {
    return 'KnowledgeClient';
  }

  protected async doConnectionTest(): Promise<void> {
    // Test connection with a simple knowledge base categories query
    await this.axios.get('/KnowledgeBaseCategories?$select=id&$top=1');
  }


  // Convenience methods for common operations

  /**
   * Get published knowledge base articles
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with published articles
   */
  async getPublishedArticles(pageSize: number = 500) {
    return this.knowledgeBaseArticles.list({
      filter: [
        {
          op: 'eq',
          field: 'isPublished',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get active documents
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active documents
   */
  async getActiveDocuments(pageSize: number = 500) {
    return this.documents.list({
      filter: [
        {
          op: 'eq',
          field: 'publish',
          value: 1, // Active/Published
        },
      ],
      pageSize,
    });
  }

  /**
   * Get knowledge base articles by category
   * @param categoryId - Category ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with category articles
   */
  async getArticlesByCategory(categoryId: number, pageSize: number = 500) {
    return this.knowledgeBaseArticles.list({
      filter: [
        {
          op: 'eq',
          field: 'categoryID',
          value: categoryId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get documents by category
   * @param categoryId - Category ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with category documents
   */
  async getDocumentsByCategory(categoryId: number, pageSize: number = 500) {
    return this.documents.list({
      filter: [
        {
          op: 'eq',
          field: 'folderID',
          value: categoryId,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get recent articles created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent articles
   */
  async getRecentArticles(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.knowledgeBaseArticles.list({
      filter: [
        {
          op: 'gte',
          field: 'createdDateTime',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createdDateTime desc',
    });
  }

  /**
   * Get recent documents created within specified days
   * @param days - Number of days to look back (default: 30)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with recent documents
   */
  async getRecentDocuments(days: number = 30, pageSize: number = 500) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return this.documents.list({
      filter: [
        {
          op: 'gte',
          field: 'createDate',
          value: cutoffDate.toISOString(),
        },
      ],
      pageSize,
      sort: 'createDate desc',
    });
  }

  /**
   * Search knowledge base articles by title or content
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['title', 'body'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching articles
   */
  async searchArticles(
    query: string,
    searchFields: string[] = ['title', 'body'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.knowledgeBaseArticles.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'title asc',
    });
  }

  /**
   * Search documents by title or description
   * @param query - Search query string
   * @param searchFields - Fields to search in (default: ['title', 'description'])
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with matching documents
   */
  async searchDocuments(
    query: string,
    searchFields: string[] = ['title', 'description'],
    pageSize: number = 100
  ) {
    const filters = searchFields.map(field => ({
      op: 'contains',
      field,
      value: query,
    }));

    return this.documents.list({
      filter: filters.length === 1 ? filters : [{ op: 'or', items: filters }],
      pageSize,
      sort: 'title asc',
    });
  }

  /**
   * Get active checklist libraries
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with active checklist libraries
   */
  async getActiveChecklistLibraries(pageSize: number = 500) {
    return this.checklistLibraries.list({
      filter: [
        {
          op: 'eq',
          field: 'isActive',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get tag groups with their tags
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with tag groups
   */
  async getActiveTagGroups(pageSize: number = 500) {
    return this.tagGroups.list({
      filter: [
        {
          op: 'eq',
          field: 'isActive',
          value: true,
        },
      ],
      pageSize,
    });
  }

  /**
   * Get articles by company (if associated)
   * @param companyId - Company ID
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with company-related articles
   */
  async getArticlesByCompany(companyId: number, pageSize: number = 500) {
    // This would typically require joining through associations
    // For now, we'll search for articles that might reference the company
    return this.knowledgeBaseArticles.list({
      filter: [
        {
          op: 'contains',
          field: 'body',
          value: companyId.toString(),
        },
      ],
      pageSize,
    });
  }

  /**
   * Get frequently accessed articles (if view count is available)
   * @param pageSize - Number of records to return (default: 100)
   * @returns Promise with popular articles
   */
  async getPopularArticles(pageSize: number = 100) {
    return this.knowledgeBaseArticles.list({
      filter: [
        {
          op: 'eq',
          field: 'isPublished',
          value: true,
        },
      ],
      pageSize,
      sort: 'viewCount desc',
    });
  }

  /**
   * Get draft articles (unpublished)
   * @param pageSize - Number of records to return (default: 500)
   * @returns Promise with draft articles
   */
  async getDraftArticles(pageSize: number = 500) {
    return this.knowledgeBaseArticles.list({
      filter: [
        {
          op: 'eq',
          field: 'isPublished',
          value: false,
        },
      ],
      pageSize,
    });
  }
}
