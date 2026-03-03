/**
 * Operational Runbook Generator Core Library.
 */

export interface IncidentType {
  name: string;
  steps: string[];
}

export function generateRunbook(incident: IncidentType): string {
  let rb = `# Operational Runbook: ${incident.name}\n\n`;
  rb += `## 🛠 Response Steps\n`;
  incident.steps.forEach((step, idx) => {
    rb += `${idx + 1}. ${step}\n`;
  });
  return rb.trim();
}
