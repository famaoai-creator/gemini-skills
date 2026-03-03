import { describe, it, expect } from 'vitest';
import { generateBoilerplate } from './lib';

describe('boilerplate-genie lib', () => {
  it('should generate express boilerplate', () => {
    const files = generateBoilerplate({ name: 'my-app', type: 'express' });
    expect(files['package.json']).toContain('"express"');
    expect(files['index.js']).toContain('require("express")');
  });

  it('should generate cli boilerplate', () => {
    const files = generateBoilerplate({ name: 'my-cli', type: 'cli' });
    expect(files['package.json']).toContain('"bin": "./index.js"');
    expect(files['index.js']).toContain('#!/usr/bin/env node');
  });
});
