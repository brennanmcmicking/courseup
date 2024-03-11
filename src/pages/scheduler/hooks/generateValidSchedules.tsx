import { Section } from 'lib/fetchers';

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

type Days = 'M' | 'T' | 'W' | 'R' | 'F';
type Time = {
  hr: number;
  mi: number;
};

type MeetingTime = {
  days: Days[];
  end_time: Time;
  start_time: Time;
};

type SectionFromScheduler = {
  codes: string[];
  crns: string[];
  meeting_times: MeetingTime[];
  name: string;
  type: 'A' | 'B' | 'T';
};

export const generateValidSchedules = ({ reportValidSchedules, courses }: GeneratorProps) => {
  // TODO: add code to generate sections here
  console.log('generateValidSchedules called');

  let params = '?';
  courses.forEach((course) => {
    params = params + `c=${course.subject}${course.code}&`;
  });

  params = params.substring(0, params.length - 1);

  console.log(`params: ${params}`);

  let generatedSchedules: FlattenedSchedule[] = [];

  const ws = new WebSocket(`ws://localhost:8765${params}`);
  ws.addEventListener('error', (e) => {
    console.log(e);
  });

  ws.addEventListener('open', () => {
    console.log('ws opened');
  });

  ws.addEventListener('close', () => {
    console.log('ws closed');
    reportValidSchedules(generatedSchedules);
  });

  ws.addEventListener('message', (m) => {
    // console.log(m);

    const d = JSON.parse(m.data) as SectionFromScheduler[];
    // reportValidSchedule(d);
    // console.log(d);
    let out: FlattenedSchedule = {
      sections: [],
      latestEndTime: 8,
      earliestStartTime: 23,
    };
    d.forEach((section) => {
      section.meeting_times.forEach((event) => {
        let startTime = event.start_time.hr + event.start_time.mi / 60;
        let endTime = event.end_time.hr + event.end_time.mi / 60;
        if (startTime < out.earliestStartTime) {
          out.earliestStartTime = startTime;
        }

        if (endTime > out.latestEndTime) {
          out.latestEndTime = endTime;
        }
      });
      courses.forEach((course) => {
        // console.log(course.sections);
        // console.log(section);
        let matchingSection = course.sections.filter((sec) => section.crns.includes(sec.crn)).at(0);
        if (matchingSection) {
          out.sections.push({
            course,
            ...matchingSection,
          });
        }
      });
    });
    console.log(out);

    generatedSchedules.push(out);
    // reportValidSchedule(d.map(section => {
    //   return {
    //     course: {
    //       subject: "",
    //       pid: "",
    //       code: "",
    //       term: "",
    //     },
    //     meetingTimes: section.meeting_times.map(mt => {
    //       return {
    //         dateRange: "",
    //         where: "ECS ?",
    //         days: "",
    //         time: "",
    //         type: "",
    //         instructors: [],
    //         scheduleType: "",
    //       }
    //     }),
    //     title: "",
    //     crn: "",
    //     sectionCode: "",
    //     associatedTerm: {
    //       end: "",
    //       start: "",
    //     },
    //     registrationDates: {
    //       end: "",
    //       start: "",
    //     },
    //     levels: [],
    //     campus: "in-person",
    //     sectionType: "lecture",
    //     instructionalMethod: "",
    //     credits: "1.5",
    //   }
    // })
  });
};
