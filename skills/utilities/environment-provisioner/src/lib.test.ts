import { describe, it, expect } from 'vitest';
import { sanitizeName, generateTerraformAWS, generateDockerfile, generateK8sManifest, ServiceDef } from './lib';

describe('environment-provisioner lib', () => {
  it('should sanitize names for IaC', () => {
    expect(sanitizeName('My Service!')).toBe('my_service_');
    expect(sanitizeName('API-v1')).toBe('api_v1');
  });

  const mockSvc: ServiceDef = { name: 'api', type: 'compute', size: 'small', port: 8080 };

  it('should generate AWS Terraform HCL', () => {
    const hcl = generateTerraformAWS(mockSvc);
    expect(hcl).toContain('resource "aws_instance" "api"');
    expect(hcl).toContain('instance_type = "t3.micro"');
  });

  it('should generate AWS DB HCL', () => {
    const dbSvc: ServiceDef = { name: 'db', type: 'database', engine: 'postgres', size: 'medium' };
    const hcl = generateTerraformAWS(dbSvc);
    expect(hcl).toContain('resource "aws_db_instance" "db"');
    expect(hcl).toContain('engine     = "postgres"');
    expect(hcl).toContain('instance_class = "db.t3.medium"');
  });

  it('should generate Dockerfile', () => {
    const docker = generateDockerfile(mockSvc);
    expect(docker).toContain('FROM node:20-slim');
    expect(docker).toContain('EXPOSE 8080');
  });

  it('should generate K8s Manifest', () => {
    const k8s = generateK8sManifest(mockSvc);
    expect(k8s).toContain('kind: Deployment');
    expect(k8s).toContain('name: api');
    expect(k8s).toContain('containerPort: 8080');
  });
});
