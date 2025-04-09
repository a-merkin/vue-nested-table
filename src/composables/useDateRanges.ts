import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Well, DateGranularity } from '../types/table';

type DateRange = {
  start: Date;
  end: Date;
  key: string;
};

export const useDateRanges = (wells: Well[], granularity: Ref<DateGranularity> | { value: DateGranularity }) => {
  const findDateRange = (wells: Well[]) => {
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    wells.forEach(well => {
      well.events.forEach(event => {
        const startDate = new Date(event.startDate || 0);
        const endDate = new Date(event.endDate || 0 );

        if (!minDate || startDate < minDate) minDate = startDate;
        if (!maxDate || endDate > maxDate) maxDate = endDate;
      });
    });

    return { minDate, maxDate };
  };

  const calculateRangeEnd = (date: Date, granularityValue: DateGranularity): Date => {
    const end = new Date(date);

    switch (granularityValue) {
      case 'day':
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        end.setDate(date.getDate() + (6 - date.getDay()));
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        end.setMonth(end.getMonth() + 1, 0);
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
      case 'week':
        next.setDate(next.getDate() + 7);
        break;
      case 'month':
        next.setMonth(next.getMonth() + 1);
        break;
    }

    return next;
  };

  const getDateRanges = (startDate: Date, endDate: Date, granularityValue: DateGranularity): DateRange[] => {
    const ranges: DateRange[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const rangeEnd = calculateRangeEnd(currentDate, granularityValue);
      ranges.push({
        start: new Date(currentDate),
        end: rangeEnd,
        key: currentDate.toISOString()
      });
      currentDate = getNextDate(currentDate, granularityValue);
    }

    return ranges;
  };

  const formatDate = (start: Date, end: Date): string => {
    switch (granularity.value) {
      case 'day':
        return start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      case 'week':
        return `${start.toLocaleDateString('ru-RU', { day: 'numeric' })} - ${end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`;
      case 'month':
        return start.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
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
