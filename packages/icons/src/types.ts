export interface IconDefinition {
  body: string | string[];
  viewBox?: string;
}

export interface IconOptions {
  className?: string;
  hidden?: boolean;
  size?: number | string;
  title?: string;
}

export type IconRegistry = Record<string, IconDefinition>;

export type IconStatus = 'stable' | 'draft' | 'deprecated';

export interface IconMetadata {
  aliases: string[];
  category: string;
  name: string;
  since?: string;
  status: IconStatus;
  tags: string[];
}

export interface IconSearchOptions {
  category?: string;
  includeDeprecated?: boolean;
}
