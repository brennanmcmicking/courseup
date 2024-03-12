export enum Day {
  Monday = 0,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

export type Course = Section[];

export type Section = MeetingTime[];

// Ranges are inclusive, so 10-11 and 11-12 conflict
// UVic schedules leave 10 minutes of time between events
export type MeetingTime = {
  begin: number;
  end: number;
  days: Day[];
};

function conflicting(a: Section, b: Section): boolean {
  for (const timeA of a) {
    for (const timeB of b) {
      if (timeA.days.some((day) => timeB.days.includes(day))) {
        if (!(timeA.end < timeB.begin || timeB.end < timeA.begin)) return true;
      }
    }
  }
  return false;
}

export function schedules(courses: Course[]): number[][] {
  if (courses.length === 0) return [];

  function valid(state: number[]): boolean {
    const schedule = courses.slice(0, state.length).map((course, i) => course[state[i]]);
    for (let i = 0; i < schedule.length; i++) {
      for (let j = i + 1; j < schedule.length; j++) {
        if (conflicting(schedule[i], schedule[j])) {
          return false;
        }
      }
    }
    return true;
  }

  const solutions: number[][] = [];

  function dfs(i: number, state: number[]) {
    if (state.length === courses.length) {
      solutions.push([...state]);
      return;
    }
    const course = courses[i];
    state.push(0);
    for (let j = 0; j < course.length; j++) {
      state[state.length - 1] = j;
      if (!valid(state)) continue;
      dfs(i + 1, state);
    }
    state.pop();
  }

  dfs(0, []);

  return solutions;
}
