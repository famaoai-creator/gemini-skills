export interface Repo {
  name: string;
  description: string;
  pushedAt: string;
  isArchived: boolean;
}

export function classifyRepos(repos: Repo[]): Record<string, Repo[]> {
  const mapping: Record<string, Repo[]> = {
    'Customer Portal (CP)': [],
    'AuthSystem (Auth)': [],
    'Common / Library': [],
    'PoC / Verification': [],
    Unclassified: [],
  };

  repos.forEach((repo) => {
    const name = repo.name.toLowerCase();
    if (name.includes('project_a-') || name.includes('project_b_')) {
      mapping['Customer Portal (CP)'].push(repo);
    } else if (name.includes('auth_sys')) {
      mapping['AuthSystem (Auth)'].push(repo);
    } else if (name.includes('common') || name.includes('lproject_a-')) {
      mapping['Common / Library'].push(repo);
    } else if (name.includes('mock') || name.includes('sample')) {
      mapping['PoC / Verification'].push(repo);
    } else {
      mapping['Unclassified'].push(repo);
    }
  });

  return mapping;
}
