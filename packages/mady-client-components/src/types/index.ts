// ==============================================
// Main types
// ==============================================
// Modified types with respect to mady-server!

// Modification: subset of Config
export type Config = {
  langs: string[];
  originalLang: string;
};

// Modifications:
// - context is always defined (incl. UNSCOPED constant)
// - add translations
// - add seqStarts
// - add isUnused, isTranslated, isFuzzy
export type Key = {
  id: string;
  isDeleted?: boolean;
  // Main contents
  context?: string | null;
  text: string;
  isMarkdown?: boolean;
  // Classification
  scope: string;
  // Message group
  seq?: number;
  // Usage
  firstUsed?: string | null;
  unusedSince?: string | null;
  sources: string[];

  translations: Record<string, Translation>;
  seqStarts: boolean;
  isUnused: boolean;
  isTranslated: boolean;
  isFuzzy: boolean;
};
export type Keys = Record<string, Key>;

// Modification: remove keyId
export type Translation = {
  id: string;
  isDeleted?: boolean;
  lang: string;
  translation: string;
  fuzzy?: boolean;
};
export type Translations = Record<string, Translation>;
