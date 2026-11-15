import type { ExperienceItem } from '../types/cv';

export function getExperienceDateLabel(experience: Pick<ExperienceItem, 'date' | 'location'>): string {
  const date = experience.date.trimEnd();
  const location = experience.location.trim();
  const duplicateLocationSuffix = ` | ${location}`;

  return location && date.endsWith(duplicateLocationSuffix)
    ? date.slice(0, -duplicateLocationSuffix.length).trimEnd()
    : date;
}
