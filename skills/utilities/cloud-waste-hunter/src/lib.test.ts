import { describe, it, expect } from 'vitest';
import { checkOversizedInstances, checkDockerfileWaste, calculateWasteScore } from './lib';

describe('cloud-waste-hunter lib', () => {
  it('should detect oversized instances in Terraform', () => {
    const content = 'resource "aws_instance" "db" { instance_type = "m5.24xlarge" }';
    const result = checkOversizedInstances(content, 'main.tf');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('oversized-instance');
    expect(result[0].impact).toBe('high');
  });

  it('should detect inefficient Docker images', () => {
    const content = 'FROM ubuntu:20.04\nRUN apt-get update';
    const result = checkDockerfileWaste(content, 'Dockerfile');
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('inefficient-image');
  });

  it('should calculate waste score correctly', () => {
    const findings: any[] = [
      { type: 'oversized-instance', impact: 'high' },
      { type: 'inefficient-image', impact: 'medium' }
    ];
    const score = calculateWasteScore(findings);
    expect(score).toBe(35); // 25 + 10
  });

  it('should return empty array for clean configs', () => {
    expect(checkOversizedInstances('instance_type = "t3.micro"', 'main.tf')).toHaveLength(0);
    expect(checkDockerfileWaste('FROM alpine:latest', 'Dockerfile')).toHaveLength(0);
  });
});
