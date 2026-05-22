import { describe, expect, it } from 'vitest';
import { renderChart } from './index.js';

describe('charts', () => {
  it('renders svg bar charts without external libraries', () => {
    const html = renderChart([{ label: 'Jan', value: 10 }], { type: 'bar' });
    expect(html).toContain('<svg');
    expect(html).toContain('<rect');
  });
});
