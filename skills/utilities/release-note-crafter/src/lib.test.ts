import { describe, it, expect } from 'vitest';
import { classifyCommit, stripPrefix } from './lib';

describe('release-note-crafter lib', () => {
  it('should classify commits correctly', () => {
    expect(classifyCommit('feat: add user')).toBe('Features');
    expect(classifyCommit('fix: fix crash')).toBe('Bug Fixes');
    expect(classifyCommit('chore: update deps')).toBe('Chores');
  });

  it('should strip prefixes', () => {
    expect(stripPrefix('feat: add user')).toBe('add user');
    expect(stripPrefix('fix(ui): button')).toBe('button');
  });
});
