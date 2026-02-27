import Mustache from 'mustache';

export function renderTemplate(template: string, data: any): string {
  return Mustache.render(template, data);
}
