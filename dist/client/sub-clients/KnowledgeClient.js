"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeClient = void 0;
const BaseSubClient_1 = require("../base/BaseSubClient");
const entities_1 = require("../../entities");
/**
 * KnowledgeClient handles all knowledge base and documentation entities:
 * - Knowledge base articles and categories
 * - Document management and organization
 * - Checklists and templates
 * - Tagging and classification
 * - Cross-references and associations
 */
class KnowledgeClient extends BaseSubClient_1.BaseSubClient {
    constructor(axios, logger) {
        super(axios, logger, 'KnowledgeClient');
        // Knowledge base
        this.knowledgeBaseArticles = new entities_1.KnowledgeBaseArticles(this.axios, this.logger);
        this.knowledgeBaseCategories = new entities_1.KnowledgeBaseCategories(this.axios, this.logger);
        // Articles
        this.articleAttachments = new entities_1.ArticleAttachments(this.axios, this.logger);
        this.articleConfigurationItemCategoryAssociations = new entities_1.ArticleConfigurationItemCategoryAssociations(this.axios, this.logger);
        this.articleNotes = new entities_1.ArticleNotes(this.axios, this.logger);
        this.articlePlainTextContent = new entities_1.ArticlePlainTextContent(this.axios, this.logger);
        this.articleTagAssociations = new entities_1.ArticleTagAssociations(this.axios, this.logger);
        this.articleTicketAssociations = new entities_1.ArticleTicketAssociations(this.axios, this.logger);
        this.articleToArticleAssociations = new entities_1.ArticleToArticleAssociations(this.axios, this.logger);
        this.articleToDocumentAssociations = new entities_1.ArticleToDocumentAssociations(this.axios, this.logger);
        // Documents
        this.documents = new entities_1.Documents(this.axios, this.logger);
        this.documentAttachments = new entities_1.DocumentAttachments(this.axios, this.logger);
        this.documentCategories = new entities_1.DocumentCategories(this.axios, this.logger);
        this.documentChecklistItems = new entities_1.DocumentChecklistItems(this.axios, this.logger);
        this.documentChecklistLibraries = new entities_1.DocumentChecklistLibraries(this.axios, this.logger);
        this.documentConfigurationItemAssociations = new entities_1.DocumentConfigurationItemAssociations(this.axios, this.logger);
        this.documentConfigurationItemCategoryAssociations = new entities_1.DocumentConfigurationItemCategoryAssociations(this.axios, this.logger);
        this.documentNotes = new entities_1.DocumentNotes(this.axios, this.logger);
        this.documentTagAssociations = new entities_1.DocumentTagAssociations(this.axios, this.logger);
        this.documentTicketAssociations = new entities_1.DocumentTicketAssociations(this.axios, this.logger);
        this.documentToArticleAssociations = new entities_1.DocumentToArticleAssociations(this.axios, this.logger);
        // Checklists
        this.checklistLibraries = new entities_1.ChecklistLibraries(this.axios, this.logger);
        this.checklistLibraryChecklistItems = new entities_1.ChecklistLibraryChecklistItems(this.axios, this.logger);
        // Tags
        this.tags = new entities_1.Tags(this.axios, this.logger);
        this.tagGroups = new entities_1.TagGroups(this.axios, this.logger);
        this.tagAliases = new entities_1.TagAliases(this.axios, this.logger);
        // Attachment info
        this.attachmentInfo = new entities_1.AttachmentInfo(this.axios, this.logger);
    }
    getName() {
        return 'KnowledgeClient';
    }
    async doConnectionTest() {
        // Test connection with a simple knowledge base categories query
        await this.axios.get('/KnowledgeBaseCategories?$select=id&$top=1');
    }
    // Convenience methods for common operations
    /**
     * Get published knowledge base articles
     * @param pageSize - Number of records to return (default: 500)
     * @returns Promise with published articles
     */
    async getPublishedArticles(pageSize = 500) {
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
    async getActiveDocuments(pageSize = 500) {
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
    async getArticlesByCategory(categoryId, pageSize = 500) {
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
    async getDocumentsByCategory(categoryId, pageSize = 500) {
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
    async getRecentArticles(days = 30, pageSize = 500) {
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
    async getRecentDocuments(days = 30, pageSize = 500) {
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
    async searchArticles(query, searchFields = ['title', 'body'], pageSize = 100) {
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
    async searchDocuments(query, searchFields = ['title', 'description'], pageSize = 100) {
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
    async getActiveChecklistLibraries(pageSize = 500) {
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
    async getActiveTagGroups(pageSize = 500) {
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
    async getArticlesByCompany(companyId, pageSize = 500) {
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
    async getPopularArticles(pageSize = 100) {
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
    async getDraftArticles(pageSize = 500) {
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
exports.KnowledgeClient = KnowledgeClient;
//# sourceMappingURL=KnowledgeClient.js.map