import { defineConfig } from 'tsup';
import { workspaceSource } from './scripts/workspace-source.mjs';

// Resolve local workspace imports to one source identity. Mixing root source
// with installed workspace dist entries duplicates runtime singletons/handlers.
export default defineConfig({ esbuildPlugins: [workspaceSource] });
