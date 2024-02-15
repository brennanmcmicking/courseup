import { Section } from 'lib/fetchers';
import { SavedCourse } from 'lib/hooks/useSavedCourses';

import { SavedCourseWithSections } from '../shared/types';

export type FlattenedSection = {
  course: SavedCourse;
} & Section;

export interface GeneratorProps {
  reportValidSchedule: (schedule: FlattenedSection[]) => void;
  courses: SavedCourseWithSections[];
}

export const generateValidSchedules = ({ reportValidSchedule, courses }: GeneratorProps) => {
  // TODO: add code to generate sections here
  console.log('generateValidSchedules called');
};
