# DATABASE.md — MongoDB Persistence Layer & Schema Documentation

> **Storage Technology**: MongoDB with Mongoose ODM  
> **Access Pattern**: Repository Pattern (`src/storage/`) — No SQL or direct Mongoose queries outside `src/storage/`  
> **Serverless Connection Management**: Cached connection pooling via `global.mongooseCache` with automated fallback to `mongodb-memory-server` for test/offline environments.

---

## 1. MongoDB Collections & Mongoose Schemas

### 1.1 `users` Collection
Stores user account profiles and authorization roles.
| Field | Type | Indexes / Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Unique user identifier |
| `fullName` | String | Required | Full name of the registered user |
| `email` | String | Required, Unique, Lowercase | Normalized user email address |
| `passwordHash` | String | Required | Bcrypt salted password hash |
| `role` | String | Default: `'user'` | Role permissions (`'user'` \| `'admin'`) |
| `isEmailVerified` | Boolean | Default: `false` | Email verification flag |
| `accountStatus` | String | Default: `'active'` | Account status (`'active'` \| `'locked'`) |
| `lastLogin` | Date | Optional | Last successful login timestamp |
| `createdAt` | Date | Auto-timestamp | Account creation timestamp |

---

### 1.2 `refreshtokens` Collection
Stores persistent refresh tokens supporting multi-device session revocation and rotation.
| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Refresh token record ID |
| `userId` | String | Foreign Key → `users.id` | Associated user ID |
| `token` | String | Indexed | Rotated refresh token string |
| `expiresAt` | Date | Required | Expiration date (Default: 7 days) |
| `isRevoked` | Boolean | Default: `false` | Revocation status flag |
| `deviceInfo` | String | Default: `'Web Browser'` | User-agent / device string |

---

### 1.3 `emailverificationtokens` & `passwordresettokens` Collections
Stores 6-digit numeric OTP codes for email verification and password resets.
| Collection | Key Fields | Expiration |
|---|---|---|
| `emailverificationtokens` | `userId`, `token` (6-digit OTP), `expiresAt` | 24 Hours |
| `passwordresettokens` | `userId`, `token` (6-digit OTP), `expiresAt`, `isUsed` | 1 Hour |

---

### 1.4 `documents` Collection
Stores raw extracted content, format metadata, and file metrics.
| Field | Type | Indexes / Notes | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Unique document ID |
| `filename` | String | Indexed (Text index) | Original file basename |
| `sourceType` | String | Required | File format (`'pdf'` \| `'transcript'` \| `'video_audio'`) |
| `rawText` | String | Indexed (Text index) | Full normalized extracted raw text |
| `metadata` | Schema.Types.Mixed | Optional | Flexible JSON metadata (page count, format, sidecars) |
| `ingestedAt` | String | ISO String | Ingestion completion timestamp |

---

### 1.5 `concepts` Collection
Stores domain concepts with canonical deduplication across multiple uploaded documents.
| Field | Type | Indexes / Notes | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Concept ID |
| `documentId` | String | FK → `documents.id` | Initial source document ID |
| `documentIds` | [String] | Array Index | All linked document IDs (Cross-doc deduplication) |
| `name` | String | Text Index | Original concept name |
| `canonicalName` | String | Indexed (Lower & Trimmed) | Normalized name for cross-document deduplication |
| `description` | String | Text Index | Concept educational definition |

---

### 1.6 `relationships` Collection
Stores directed graph edges connecting concept nodes.
| Field | Type | Indexes | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Edge ID |
| `fromConceptId` | String | FK → `concepts.id` | Source concept ID |
| `toConceptId` | String | FK → `concepts.id` | Target concept ID |
| `type` | String | Enum Index | Connection type (`'prerequisite'` \| `'related-to'` \| `'part-of'`) |

---

### 1.7 `flashcards` Collection
Stores generated question/answer study cards.
| Field | Type | Indexes | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Flashcard ID |
| `conceptId` | String | FK → `concepts.id` | Associated concept ID |
| `question` | String | Text Index | Generated study question |
| `answer` | String | Text Index | Study answer definition |

---

### 1.8 `summaries` Collection
Stores high-level document summaries.
| Field | Type | Notes | Description |
|---|---|---|---|
| `id` | String | Primary Key (UUID) | Summary record ID |
| `documentId` | String | FK → `documents.id` | Associated document ID |
| `summaryText` | String | Text blob | Document summary text |

---

### 1.9 `conceptembeddings` Collection
Stores 128-dimensional TF-IDF vector embeddings for local semantic cosine search fallback.
| Field | Type | Notes | Description |
|---|---|---|---|
| `conceptId` | String | Primary Key → `concepts.id` | Target concept ID |
| `embedding` | [Number] | 128 Float64 Array | L2-normalized TF-IDF character trigram vector |

---

## 2. Text Search & Compound Indexes

MongoDB compound text indexes enable high-speed global search queries across documents, concepts, and flashcards:

```typescript
// Compound Text Index on Documents
DocumentSchema.index({ filename: 'text', rawText: 'text' });

// Compound Text Index on Concepts
ConceptSchema.index({ name: 'text', description: 'text' });

// Compound Text Index on Flashcards
FlashcardSchema.index({ question: 'text', answer: 'text' });
```

---

## 3. Serverless Connection Management (`src/storage/db.ts`)

To prevent connection pool exhaustion during rapid API execution (e.g. on serverless Vercel deployments), Mongoose connections are cached globally on `global.mongooseCache`:

```typescript
// src/storage/db.ts
let cached = (global as any).mongooseCache || { conn: null, promise: null };

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    let uri = CONFIG.MONGODB_URI;
    // Auto-fallback to Memory Server in test/offline environments
    if (process.env.NODE_ENV === 'test' || !uri) {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }
    cached.promise = mongoose.connect(uri);
  }

  cached.conn = await cached.promise;
  (global as any).mongooseCache = cached;
  return cached.conn;
}
```

---

## 4. Storage Layer Access Rules

1. **Repository Pattern Isolation:** All database queries must go through repository files (`documentRepository.ts`, `conceptRepository.ts`, `relationshipRepository.ts`, `flashcardRepository.ts`, `summaryRepository.ts`, `embeddingRepository.ts`).
2. **Domain Object Mapping:** Repositories convert raw Mongoose Lean documents into plain TypeScript domain objects (`SourceDocument`, `Concept`, `Relationship`, `Flashcard`, `Summary`) before returning data to the business logic layer.
