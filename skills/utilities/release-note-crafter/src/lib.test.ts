import { describe, it, expect } from 'vitest';
import { craftReleaseNote, ReleaseNoteData } from './lib';

describe('release-note-crafter lib', () => {
  it('should generate a release note from data', () => {
    const data: ReleaseNoteData = {
      version: '1.2.0',
      changes: [
        { type: 'feat', message: 'Add OAuth support' },
        { type: 'fix', message: 'Fix login crash' },
        { type: 'chore', message: 'Update deps' }
      ]
    };
    const note = craftReleaseNote(data);
    expect(note).toContain('# Release 1.2.0');
    expect(note).toContain('New Features');
    expect(note).toContain('Add OAuth support');
    expect(note).toContain('Bug Fixes');
    expect(note).not.toContain('Update deps'); // Chores are excluded in simple template
  });
});
