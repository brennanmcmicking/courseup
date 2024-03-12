import { Section } from 'lib/fetchers';

import { Course, Day, MeetingTime, schedules } from '../shared/scheduler';
import { SavedCourseWithSections } from '../shared/types';

export type FlattenedSection = {
  course: SavedCourseWithSections;
} & Section;

export type FlattenedSchedule = {
  sections: FlattenedSection[];
  earliestStartTime: number;
  latestEndTime: number;
};

export interface GeneratorProps {
  reportValidSchedules: (schedules: FlattenedSchedule[]) => void;
  courses: SavedCourseWithSections[];
}

function parseDays(daysString: string): Day[] {
  const days = new Set(
    [...daysString.split('')].map((day) => {
      switch (day) {
        case 'M':
          return Day.Monday;
        case 'T':
          return Day.Tuesday;
        case 'W':
          return Day.Wednesday;
        case 'R':
          return Day.Thursday;
        case 'F':
          return Day.Friday;
        case 'S':
          return Day.Saturday;
        default:
          throw new Error('Unknown day: ' + day);
      }
    })
  );
  const dayList = Array.from(days.values());
  dayList.sort((a, b) => a - b);
  return dayList;
}

function parseTime(time: string): number {
  const match = /^(\d+):(\d+) (am|pm)$/.exec(time);
  if (match === null) throw new Error('Invalid time: ' + time);

  let hours = parseInt(match.at(1)!);
  const minutes = parseInt(match.at(2)!);
  if (match.at(3) === 'pm') {
    hours += 12;
  }
  return hours * 100 + minutes;
}

function parseTimeRange(range: string): { begin: number; end: number } {
  const times = range.split('-').map((s) => s.trim());
  if (times.length !== 2) throw new Error('Time range should only have one dash: ' + range);

  const [begin, end] = times;
  return {
    begin: parseTime(begin),
    end: parseTime(end),
  };
}

function adaptSectionGroups(groups: FlattenedSection[][]): Course[] {
  return groups.map((group) =>
    group.map((section) =>
      section.meetingTimes.map(
        (time): MeetingTime => ({
          ...parseTimeRange(time.time),
          days: parseDays(time.days),
        })
      )
    )
  );
}

export const generateValidSchedules = ({ reportValidSchedules, courses }: GeneratorProps) => {
  console.log('generateValidSchedules called', courses);

  const sectionGroups: FlattenedSection[][] = courses.flatMap((course) => {
    const lectures: FlattenedSection[] = [];
    const labs: FlattenedSection[] = [];
    const tutorials: FlattenedSection[] = [];
    for (const section of course.sections) {
      const flattened: FlattenedSection = { ...section, course };
      switch (section.sectionCode[0]) {
        case 'A':
          lectures.push(flattened);
          break;
        case 'B':
          labs.push(flattened);
          break;
        case 'T':
          tutorials.push(flattened);
          break;
      }
    }
    return [lectures, labs, tutorials].filter((a) => a.length > 0);
  });

  const candidates = schedules(adaptSectionGroups(sectionGroups));

  const validSchedules: FlattenedSchedule[] = candidates.map((candidate) => {
    const sections = sectionGroups.map((group, i) => group[candidate[i]]);
    let earliestStartTime = 2400;
    let latestEndTime = 0;
    for (const section of sections) {
      for (const time of section.meetingTimes) {
        const { begin, end } = parseTimeRange(time.time);
        earliestStartTime = Math.max(earliestStartTime, begin);
        latestEndTime = Math.min(latestEndTime, end);
      }
    }
    return { sections, earliestStartTime, latestEndTime };
  });
  reportValidSchedules(validSchedules);
};
