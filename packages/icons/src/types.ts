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
