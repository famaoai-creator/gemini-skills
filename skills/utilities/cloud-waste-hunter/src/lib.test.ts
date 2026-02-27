import { describe, it, expect } from 'vitest';
import { checkOversizedInstances } from './lib';

describe('cloud-waste-hunter lib', () => {
  it('should detect oversized instances', () => {
    const content = 'instance_type = "m5.24xlarge"';
    const result = checkOversizedInstances(content, 'main.tf');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('oversized-instance');
  });
});
