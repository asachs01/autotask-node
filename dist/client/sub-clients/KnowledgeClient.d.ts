import { AxiosInstance } from 'axios';
import winston from 'winston';
import { BaseSubClient } from '../base/BaseSubClient';
import { KnowledgeBaseArticles, KnowledgeBaseCategories, ArticleAttachments, ArticleConfigurationItemCategoryAssociations, ArticleNotes, ArticlePlainTextContent, ArticleTagAssociations, ArticleTicketAssociations, ArticleToArticleAssociations, ArticleToDocumentAssociations, Documents, DocumentAttachments, DocumentCategories, DocumentChecklistItems, DocumentChecklistLibraries, DocumentConfigurationItemAssociations, DocumentConfigurationItemCategoryAssociations, DocumentNotes, DocumentTagAssociations, DocumentTicketAssociations, DocumentToArticleAssociations, ChecklistLibraries, ChecklistLibraryChecklistItems, Tags, TagGroups, TagAliases, AttachmentInfo } from '../../entities';
/**
 * KnowledgeClient handles all knowledge base and documentation entities:
 * - Knowledge base articles and categories
 * - Document management and organization
 * - Checklists and templates
 * - Tagging and classification
 * - Cross-references and associations
 */
export declare class KnowledgeClient extends BaseSubClient {
    readonly knowledgeBaseArticles: KnowledgeBaseArticles;
    readonly knowledgeBaseCategories: KnowledgeBaseCategories;
    readonly articleAttachments: ArticleAttachments;
    readonly articleConfigurationItemCategoryAssociations: ArticleConfigurationItemCategoryAssociations;
    readonly articleNotes: ArticleNotes;
    readonly articlePlainTextContent: ArticlePlainTextContent;
    readonly articleTagAssociations: ArticleTagAssociations;
    readonly articleTicketAssociations: ArticleTicketAssociations;
    readonly articleToArticleAssociations: ArticleToArticleAssociations;
    readonly articleToDocumentAssociations: ArticleToDocumentAssociations;
    readonly documents: Documents;
    readonly documentAttachments: DocumentAttachments;
    readonly documentCategories: DocumentCategories;
    readonly documentChecklistItems: DocumentChecklistItems;
    readonly documentChecklistLibraries: DocumentChecklistLibraries;
    readonly documentConfigurationItemAssociations: DocumentConfigurationItemAssociations;
    readonly documentConfigurationItemCategoryAssociations: DocumentConfigurationItemCategoryAssociations;
    readonly documentNotes: DocumentNotes;
    readonly documentTagAssociations: DocumentTagAssociations;
    readonly documentTicketAssociations: DocumentTicketAssociations;
    readonly documentToArticleAssociations: DocumentToArticleAssociations;
    readonly checklistLibraries: ChecklistLibraries;
    readonly checklistLibraryChecklistItems: ChecklistLibraryChecklistItems;
    readonly tags: Tags;
    readonly tagGroups: TagGroups;
    readonly tagAliases: TagAliases;
    readonly attachmentInfo: AttachmentInfo;
    constructor(axios: AxiosInstance, logger: winston.Logger);
    getName(): string;
    protected doConnectionTest(): Promise<void>;
    /**
     * Get published knowledge base articles
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with published articles
     */
    getPublishedArticles(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
    /**
     * Get active documents
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active documents
     */
    getActiveDocuments(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/documents").IDocuments[]>>;
    /**
     * Get knowledge base articles by category
     * @param categoryId - Category ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with category articles
     */
    getArticlesByCategory(categoryId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
    /**
     * Get documents by category
     * @param categoryId - Category ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with category documents
     */
    getDocumentsByCategory(categoryId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/documents").IDocuments[]>>;
    /**
     * Get recent articles created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent articles
     */
    getRecentArticles(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
    /**
     * Get recent documents created within specified days
     * @param days - Number of days to look back (default: 30)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with recent documents
     */
    getRecentDocuments(days?: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/documents").IDocuments[]>>;
    /**
     * Search knowledge base articles by title or content
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['title', 'body'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching articles
     */
    searchArticles(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
    /**
     * Search documents by title or description
     * @param query - Search query string
     * @param searchFields - Fields to search in (default: ['title', 'description'])
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with matching documents
     */
    searchDocuments(query: string, searchFields?: string[], pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/documents").IDocuments[]>>;
    /**
     * Get active checklist libraries
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with active checklist libraries
     */
    getActiveChecklistLibraries(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/checklistlibraries").IChecklistLibraries[]>>;
    /**
     * Get tag groups with their tags
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with tag groups
     */
    getActiveTagGroups(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/taggroups").ITagGroups[]>>;
    /**
     * Get articles by company (if associated)
     * @param companyId - Company ID
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with company-related articles
     */
    getArticlesByCompany(companyId: number, pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
    /**
     * Get frequently accessed articles (if view count is available)
     * @param pageSize - Number of records to return (default: 100)
     * @returns Promise with popular articles
     */
    getPopularArticles(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
    /**
     * Get draft articles (unpublished)
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with draft articles
     */
    getDraftArticles(pageSize?: number): Promise<import("../../types").ApiResponse<import("../../entities/knowledgebasearticles").IKnowledgeBaseArticles[]>>;
}
//# sourceMappingURL=KnowledgeClient.d.ts.map