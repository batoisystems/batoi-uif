interface IconDefinition {
    body: string | string[];
    viewBox?: string;
}
interface IconOptions {
    className?: string;
    hidden?: boolean;
    size?: number | string;
    title?: string;
}
type IconRegistry = Record<string, IconDefinition>;
type IconStatus = 'stable' | 'draft' | 'deprecated';
interface IconMetadata {
    aliases: string[];
    category: string;
    name: string;
    since?: string;
    status: IconStatus;
    tags: string[];
}
type IconMetadataRegistry<Name extends string = string> = Readonly<Record<Name, IconMetadata>>;
interface IconSearchOptions {
    category?: string;
    includeDeprecated?: boolean;
}

export type { IconDefinition as I, IconMetadata as a, IconMetadataRegistry as b, IconOptions as c, IconRegistry as d, IconSearchOptions as e, IconStatus as f };
