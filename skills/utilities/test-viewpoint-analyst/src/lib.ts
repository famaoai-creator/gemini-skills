export interface TestCase {
  id: string;
  ref: string;
  category: string;
  scenario: string;
  expected: string;
}

export function generateTestCases(reqAdf: any): TestCase[] {
  const testCases: TestCase[] = [];
  if (!reqAdf.requirements || !Array.isArray(reqAdf.requirements)) return [];

  reqAdf.requirements.forEach((req: any) => {
    testCases.push({
      id: 'TC-' + req.id + '-01',
      ref: req.id,
      category: 'Normal',
      scenario: 'Valid application of ' + req.title,
      expected: 'Success',
    });

    const rule = (req.rule || '').toLowerCase();
    if (rule.includes('threshold') || rule.includes('$') || rule.includes('%')) {
      testCases.push({
        id: 'TC-' + req.id + '-02',
        ref: req.id,
        category: 'Boundary',
        scenario: 'Value at the exact threshold for ' + req.title,
        expected: 'Borderline Handling',
      });
    }
  });
  return testCases;
}
