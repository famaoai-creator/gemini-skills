import { describe, it, expect } from 'vitest';
import { parseHCL, generateSummary } from './lib';

describe('terraform-arch-mapper lib', () => {
  it('should parse HCL resource definitions', () => {
    const hcl = `
resource "aws_instance" "web" { ami = "x" }
resource "aws_db_instance" "db" { engine = "y" }
resource "google_compute_instance" "app" { name = "z" }
    `;
    const resources = parseHCL(hcl);
    expect(resources).toHaveLength(3);
    expect(resources[0]).toEqual({ type: 'aws_instance', name: 'web', provider: 'aws' });
    expect(resources[2].provider).toBe('google');
  });

  it('should generate summary of resources', () => {
    const resources = [
      { type: 'aws_instance', name: 'a', provider: 'aws' },
      { type: 'aws_instance', name: 'b', provider: 'aws' },
      { type: 'aws_s3_bucket', name: 'c', provider: 'aws' }
    ];
    const summary = generateSummary(resources);
    expect(summary).toContain('aws_instance: 2');
    expect(summary).toContain('aws_s3_bucket: 1');
  });
});
