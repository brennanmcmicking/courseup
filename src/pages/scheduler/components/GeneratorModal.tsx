import { useState } from 'react';

import {
  Flex,
  Button,
  ButtonGroup,
  Modal,
  ModalContent,
  ModalOverlay,
  Tooltip,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
} from '@chakra-ui/react';

import { FlattenedSection } from '../hooks/generateValidSchedules';

import { SchedulerCalendar } from './SchedulerCalendar';

export interface GeneratorModalProps {
  isOpen: boolean;
  term: string;
  schedules: FlattenedSection[][];
  closeHook: () => void;
  updateHook: (sections: FlattenedSection[]) => void;
}

const timeExtractor = new RegExp('(\\d{1,2}):(\\d{2})\\s([a|p]m)\\s-\\s(\\d{1,2}):(\\d{2})\\s([a|p]m)');

const to24Hour = (hour: number, suffix: string) => {
  if (suffix === 'pm' && hour < 12) {
    return hour + 12;
  }

  return hour;
};

export const GeneratorModal = (props: GeneratorModalProps) => {
  const [scheduleIndex, setScheduleIndex] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState([8, 23]);
  const [showTooltip, setShowTooltip] = useState(false);

  const hourToLabel = (hour: number): string => {
    if (hour < 12) {
      return `${hour}am`;
    } else if (hour === 12) {
      return '12pm';
    }
    return `${hour - 12}pm`;
  };

  // const combedSchedules = props.schedules.filter((schedule) => {
  //   // filter to only meeting times which violate the constraints,
  //   // thus a simple check to make sure the result is empty tells us
  //   // if there's schedules outside the time range
  //   // return (
  //   //   schedule.filter((meeting) => {
  //   //     meeting.meetingTime.time.includes('12:00pm');
  //   //   }).length === 0
  //   // );
  //   return true;
  // });

  const combedSchedules = props.schedules.filter((schedule) => {
    let earliestStartTime = 23;
    let latestEndTime = 8;
    schedule.forEach((section) => {
      section.meetingTimes.forEach((event) => {
        const m = timeExtractor.exec(event.time);
        if (m) {
          // group 1: start hour
          // group 2: start minute
          // group 3: start suffix (am | pm)
          // group 4: end hour
          // group 5: end minute
          // group 6: end suffix (am | pm)
          // for example: 12:30 pm - 1:20 pm
          const startTime = to24Hour(parseInt(m[1]), m[3]);
          const endTime = to24Hour(parseInt(m[4]), m[6]) + 1; // treat courses that end at 12:20 or 12:50 like the end at 13:00

          if (startTime < earliestStartTime) {
            earliestStartTime = startTime;
          }

          if (endTime > latestEndTime) {
            latestEndTime = endTime;
          }
        } else {
          console.error(`could not parse event meeting time ${event.time}`);
        }
      });
    });
    return sliderValue[0] >= earliestStartTime && sliderValue[1] <= latestEndTime;
  });

  const incrementScheduleIndex = () => {
    if (scheduleIndex < props.schedules.length - 1) {
      setScheduleIndex(scheduleIndex + 1);
    }
  };

  const decrementScheduleIndex = () => {
    if (scheduleIndex > 0) {
      setScheduleIndex(scheduleIndex - 1);
    }
  };

  return (
    <Modal isOpen={props.isOpen} onClose={props.closeHook} size="6xl" scrollBehavior="outside">
      <ModalOverlay />
      <ModalContent padding={5}>
        <Flex gap={5} mb={5}>
          <RangeSlider
            id="slider"
            defaultValue={[8, 23]}
            min={8}
            max={23}
            onChange={(v) => setSliderValue(v)}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            width="80%"
            isDisabled={props.schedules.length === 0}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <Tooltip hasArrow placement="top" isOpen={showTooltip} label={`${hourToLabel(sliderValue[0])}`}>
              <RangeSliderThumb index={0} />
            </Tooltip>
            <Tooltip hasArrow placement="top" isOpen={showTooltip} label={`${hourToLabel(sliderValue[1])}`}>
              <RangeSliderThumb index={1} />
            </Tooltip>
          </RangeSlider>
          <Flex width="20%">
            <ButtonGroup isAttached isDisabled={combedSchedules.length === 0}>
              <Button onClick={incrementScheduleIndex}>Previous</Button>
              <Tooltip
                hasArrow
                placement="top"
                isOpen={props.schedules.length > 20}
                label="There are many schedules available, try using the slider to filter the results"
              >
                <Button style={{ cursor: 'default' }} isLoading={combedSchedules.length === 0}>
                  {scheduleIndex + 1}/{props.schedules.length}
                </Button>
              </Tooltip>
              <Button onClick={decrementScheduleIndex}>Next</Button>
            </ButtonGroup>
          </Flex>
        </Flex>
        {combedSchedules.length > 0 ? (
          // <SchedulerCalendar term={props.term} courseCalendarEvents={props.schedules.at(scheduleIndex)} />
          <Text>TODO: convert FlattenedSection list to CourseCalendarEvent list</Text>
        ) : (
          <SchedulerCalendar term={props.term} courseCalendarEvents={[]} />
        )}
        <ButtonGroup marginTop={5} marginLeft="auto" marginRight={0}>
          <Button onClick={props.closeHook}>Cancel</Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              props.updateHook(combedSchedules.at(scheduleIndex) ?? []);
            }}
            disabled={combedSchedules.length === 0}
          >
            Apply
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};
