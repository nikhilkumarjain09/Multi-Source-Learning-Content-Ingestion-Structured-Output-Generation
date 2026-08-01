/**
 * SynthLearn Enterprise UI Language & Copy Dictionary
 * 
 * Centralized, production-quality SaaS terminology for end users.
 * Replaces developer implementation terminology with professional product copy.
 */

export const UI_STRINGS = {
  // Navigation & Workspace Sections
  NAV: {
    WORKSPACE_GROUP: 'MY WORKSPACE',
    KNOWLEDGE_GROUP: 'KNOWLEDGE & INTELLIGENCE',
    SYSTEM_GROUP: 'ANALYTICS & SYSTEM',

    DASHBOARD: 'Dashboard',
    DOCUMENTS: 'Learning Library',
    QUEUE: 'Activity Log',
    GRAPH: 'Knowledge Map',
    CONCEPTS: 'Topic Library',
    FLASHCARDS: 'Study Decks',
    LEARNING_PATHS: 'Learning Paths',
    SUMMARIES: 'Executive Summaries',
    AI_INSIGHTS: 'AI Insights',
    TOPICS: 'Topic Index',
    ANALYTICS: 'Analytics',
    EXPORTS: 'Exports Hub',
    SETTINGS: 'Settings',

    DASHBOARD_FULL: 'Dashboard Overview',
    DOCUMENTS_FULL: 'Learning Library',
    QUEUE_FULL: 'Activity & Analysis Log',
    GRAPH_FULL: 'Interactive Knowledge Map',
    CONCEPTS_FULL: 'Topic Library & Index',
    FLASHCARDS_FULL: 'Study Decks & Revision Cards',
    LEARNING_PATHS_FULL: 'Learning Paths & Sequence Roadmaps',
    SUMMARIES_FULL: 'Executive Summary Engine',
    AI_INSIGHTS_FULL: 'AI Knowledge Insights',
    TOPICS_FULL: 'Topic Index',
    ANALYTICS_FULL: 'Learning Analytics',
    EXPORTS_FULL: 'Exports Hub',
    SETTINGS_FULL: 'Account & Workspace Settings',
  },

  // Common Buttons & Actions
  ACTIONS: {
    IMPORT_CONTENT: 'Import Learning Material',
    UPLOAD_DOCUMENT: 'Upload Material',
    START_ANALYSIS: 'Analyze Content',
    ANALYZING: 'Analyzing Content & Building Knowledge Map...',
    PROCESSING: 'Processing Material...',
    VIEW_DETAILS: 'Inspect Details',
    DELETE: 'Delete',
    KEEP: 'Keep',
    CONFIRM: 'Confirm',
    CANCEL: 'Cancel',
    SEARCH_PLACEHOLDER: 'Search knowledge base...',
    DOWNLOAD: 'Export Data',
    DOWNLOAD_SPREADSHEET: 'Spreadsheet Export',
    DOWNLOAD_DATA: 'Data Export',
    CLOSE: 'Close',
    RETRY: 'Please try again.',
  },

  // Metric & Stat Labels
  METRICS: {
    DOCUMENTS: 'Learning Materials',
    CONCEPTS: 'Knowledge Topics',
    RELATIONSHIPS: 'Topic Connections',
    FLASHCARDS: 'Study Cards',
    INDEXED_READY: 'Indexed & Ready',
  },

  // Dashboard Copy
  DASHBOARD: {
    BANNER_TITLE: 'Learning Workspace Overview',
    BANNER_SUBTITLE: 'Your AI Learning Workspace is active. Upload documents, transcripts, or notes to automatically generate interactive knowledge maps, study decks, and custom learning paths.',
    RECENT_FILES_TITLE: 'Recent Learning Materials',
    RECENT_FILES_EMPTY_TITLE: 'No learning materials yet.',
    RECENT_FILES_EMPTY_DESC: 'Upload your first document or transcript to generate summaries, study cards, and knowledge maps.',
    EXTRACTED_TOPICS_TITLE: 'Featured Knowledge Topics',
    EXTRACTED_TOPICS_EMPTY: 'Knowledge topics will populate automatically as you add content.',
    QUICK_TASKS_TITLE: 'Quick Actions',
    LAUNCH_STUDY_CARDS: 'Open Study Decks',
    VIEW_ROADMAP: 'View Learning Path Roadmap',
  },

  // Processing & Activity Log (formerly Queue & Pipeline)
  ACTIVITY: {
    TITLE: 'Analysis & Processing Activity',
    SUBTITLE: 'Live status of content preparation, AI knowledge analysis, quality checks, and search indexing.',
    STATUS_ACTIVE: 'Analysis Active',
    STATUS_IDLE: 'System Ready',
    PROCESSING_BANNER_TITLE: 'Currently Processing:',
    PROCESSING_BANNER_DESC: 'Analyzing content structure, mapping topics, and building learning connections...',
    
    STAGES: {
      PARSING: {
        name: 'Content Preparation',
        desc: 'Extracts and prepares readable text from your uploaded file',
      },
      NORMALIZATION: {
        name: 'Document Formatting',
        desc: 'Standardizes document structure and verifies text formatting',
      },
      EXTRACTION: {
        name: 'AI Knowledge Analysis',
        desc: 'Identifies key topics, definitions, and learning connections',
      },
      VALIDATION: {
        name: 'Quality Verification',
        desc: 'Verifies structured output clarity and accuracy',
      },
      STORAGE: {
        name: 'Secure Storage & Linking',
        desc: 'Saves topics and connects related learning materials',
      },
      EMBEDDINGS: {
        name: 'Semantic Search Indexing',
        desc: 'Indexes content to enable fast, intelligent search',
      },
    },
  },

  // Standard Enterprise Error Messages
  ERRORS: {
    GENERIC: "We couldn't complete your request. Please try again.",
    NETWORK: 'Unable to connect. Please check your network connection and try again.',
    UPLOAD_FAILED: "We couldn't process this document. Please check the file format and try again.",
    AUTH_FAILED: 'Authentication failed. Please check your credentials and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  },

  // System Status
  STATUS: {
    SYSTEM_OPERATIONAL: 'System Operational',
    PROCESSED: 'Processed',
    PARSED: 'Ready',
  },
};
