import { describe, it, expect } from 'vitest';
import { sanitizeName, generateTerraformAWS } from './lib';

describe('environment-provisioner lib', () => {
  it('should sanitize names', () => {
    expect(sanitizeName('My Service!')).toBe('my_service_');
  });

  it('should generate AWS HCL', () => {
    const svc = { name: 'web' };
    const hcl = generateTerraformAWS(svc);
    expect(hcl).toContain('aws_instance');
    expect(hcl).toContain('"web"');
  });
});
