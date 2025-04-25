import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Well, DateGranularity, OperatingStateEntry, Resource, Stage, Event } from '../types/table';
import { format } from 'date-fns';

export type DateRange = {
  start: Date;
  end: Date;
  key: string;
};

export const useDateRanges = (wells: Well[], granularity: Ref<DateGranularity> | { value: DateGranularity }) => {
  const findDateRange = (wells: Well[]) => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    const updateDateRange = (startDate: string | null, endDate: string | null) => {
      if (!startDate || !endDate) return;

      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

        if (granularity.value === 'year') {
          start.setMonth(0, 1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(11, 31);
          end.setHours(23, 59, 59, 999);
        } else {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }

        if (!minDate || start < minDate) minDate = start;
        if (!maxDate || end > maxDate) maxDate = end;
      } catch {
        console.warn('Invalid date format:', { startDate, endDate });
      }
    };

    const processEvent = (event: Event) => {
      updateDateRange(event.startDate, event.endDate);

      if (event.operating_states) {
        event.operating_states.forEach((state: OperatingStateEntry) => {
          updateDateRange(state.startDate, state.endDate);
        });
      }

      if (event.resources) {
        event.resources.forEach((resource: Resource) => {
          updateDateRange(resource.startDate, resource.endDate);

          if (resource.stages) {
            resource.stages.forEach((stage: Stage) => {
              updateDateRange(stage.startDate, stage.startDate);
            });
          }
        });
      }
    };

    wells.forEach(well => {
      if (well.events) {
        well.events.forEach(processEvent);
      }
    });

    if (!minDate || !maxDate) {
      const now = new Date();
      minDate = new Date(now.getFullYear(), 0, 1);
      maxDate = new Date(now.getFullYear(), 11, 31);
      maxDate.setHours(23, 59, 59, 999);
    }

    return { minDate, maxDate };
  };

  const calculateRangeEnd = (date: Date, granularityValue: DateGranularity): Date => {
    const end = new Date(date);

    switch (granularityValue) {
      case 'day':
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        end.setFullYear(end.getFullYear() + 1, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return end;
  };

  const getNextDate = (date: Date, granularityValue: DateGranularity): Date => {
    const next = new Date(date);

    switch (granularityValue) {
      case 'day':
        next.setDate(next.getDate() + 1);
        break;
      case 'month':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'year':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }

    return next;
  };

  const getDateRanges = (startDate: Date, endDate: Date, granularityValue: DateGranularity): DateRange[] => {
    const ranges: DateRange[] = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    if (startDate.getTime() === endDate.getTime()) {
      const rangeStart = new Date(startDate);
      const rangeEnd = calculateRangeEnd(startDate, granularityValue);
      ranges.push({
        start: rangeStart,
        end: rangeEnd,
        key: startDate.toISOString()
      });
      return ranges;
    }

    while (currentDate <= endDate) {
      const rangeStart = new Date(currentDate);
      const rangeEnd = calculateRangeEnd(currentDate, granularityValue);
      
      ranges.push({
        start: rangeStart,
        end: rangeEnd,
        key: currentDate.toISOString()
      });
      currentDate = getNextDate(currentDate, granularityValue);
    }

    if (ranges.length === 0) {
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = calculateRangeEnd(yearStart, granularityValue);
      ranges.push({
        start: yearStart,
        end: yearEnd,
        key: yearStart.toISOString()
      });
    }

    return ranges;
  };

  const formatDate = (start: Date): string => {
    switch (granularity.value) {
      case 'day':
        return format(start, 'yyyy-MM-dd');
      case 'month':
        return format(start, 'yyyy-MM');
      case 'year':
        return `${format(start, 'yyyy')}`;
      default:
        return '';
    }
  };

  const groupedDates = computed<DateRange[]>(() => {
    const { minDate, maxDate } = findDateRange(wells);
    if (!minDate || !maxDate) return [];
    return getDateRanges(minDate, maxDate, granularity.value);
  });

  return {
    groupedDates,
    formatDate
  };
};
