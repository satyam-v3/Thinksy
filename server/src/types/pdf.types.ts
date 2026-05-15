/**
 * PDF feature DTOs.
 * Feature-specific types for:
 * - PDF upload/parsing
 * - semantic chunking
 * - embeddings/vectorization
 */

// ─────────────────────────────────────────────
// PDF Upload + Parsing Types
// ─────────────────────────────────────────────

export interface UploadedPdfMeta {
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storedPath: string;
}

export interface ParsedPdf {
  text: string;
  totalPages: number;
}

export interface PdfUploadResult
  extends UploadedPdfMeta,
  ParsedPdf {
  message: string;

  // Optional AI pipeline metadata
  totalChunks?: number;
}

// ─────────────────────────────────────────────
// Chunking Types
// ─────────────────────────────────────────────

export interface ChunkMetadata {
  /**
   * Stable chunk identifier
   * Example:
   * lecture-notes-chunk-0
   */
  chunkId: string;

  /**
   * Original source filename
   */
  source: string;

  originalName?: string;

  /**
   * Position in chunk array
   */
  chunkIndex: number;

  /**
   * Optional page info
   */
  pageInfo: string | null;

  /**
   * ISO timestamp
   */
  createdAt: string;
}

export interface TextChunk {
  text: string;
  metadata: ChunkMetadata;
}

// ─────────────────────────────────────────────
// Embedding Types
// ─────────────────────────────────────────────

export interface EmbeddedChunk {
  text: string;

  /**
   * Vector embedding values
   */
  embedding: number[];

  metadata: ChunkMetadata;
}

// ─────────────────────────────────────────────
// Configuration Types
// ─────────────────────────────────────────────

export interface ChunkOptions {
  /**
   * Target chunk size in characters
   */
  chunkSize?: number;

  /**
   * Overlap between chunks
   */
  overlap?: number;

  /**
   * Source filename
   */
  source?: string;

  originalName?: string;
}

export interface EmbedOptions {
  /**
   * Batch size for embedding generation
   */
  batchSize?: number;
}

// ─────────────────────────────────────────────
// Vectorization Result
// ─────────────────────────────────────────────

export interface VectorizationResult {
  source: string;
  totalChunks: number;
  embeddedChunks: EmbeddedChunk[];
}