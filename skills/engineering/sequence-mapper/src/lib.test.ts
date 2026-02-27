import { describe, it, expect } from 'vitest';
import { generateSequenceDiagram } from './lib';

describe('generateSequenceDiagram', () => {
  it('generates diagram for function calls', () => {
    const code = `
function main() {
  foo();
  bar();
}
function foo() {
  console.log("foo");
}
`;
    const diagram = generateSequenceDiagram(code);
    expect(diagram).toContain('sequenceDiagram');
    expect(diagram).toContain('main->>foo: foo()');
    expect(diagram).toContain('main->>bar: bar()');
  });

  it('updates current function context', () => {
    const code = `
function A() {
  B();
}
function B() {
  C();
}
`;
    const diagram = generateSequenceDiagram(code);
    expect(diagram).toContain('A->>B: B()');
    expect(diagram).toContain('B->>C: C()');
  });

  it('ignores control flow keywords', () => {
    const code = `
function test() {
  if (true) {}
  for (let i=0; i<10; i++) {}
}
`;
    const diagram = generateSequenceDiagram(code);
    expect(diagram).not.toContain('test->>if');
    expect(diagram).not.toContain('test->>for');
  });
});
