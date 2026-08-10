// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { collectReleaseMetadata } from './release-metadata.mjs';

const root = new URL('..', import.meta.url);

describe('release supply-chain metadata', () => {
  it('matches reproducible generated SBOM and provenance documents', () => {
    const current = collectReleaseMetadata(root);
    expect(JSON.parse(readFileSync(new URL('dist/sbom.cdx.json', root), 'utf8'))).toEqual(current.sbom);
    expect(JSON.parse(readFileSync(new URL('dist/provenance.json', root), 'utf8'))).toEqual(current.provenance);
    expect(current.sbom.components.every((component) => component.properties[0].value === '0' || component.name.startsWith('@batoi/'))).toBe(true);
  });

  it('covers all distributable browser artifacts with SHA-256 subjects', () => {
    const { provenance } = collectReleaseMetadata(root);
    expect(provenance.subject).toHaveLength(6);
    expect(provenance.subject.every((subject) => /^[a-f0-9]{64}$/.test(subject.digest.sha256))).toBe(true);
  });
});
