import { computed } from 'vue';
import type { Ref } from 'vue';
import type { Well, DateGranularity } from '../types/table';

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

        // Проверяем валидность дат
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        if (!minDate || start < minDate) minDate = start;
        if (!maxDate || end > maxDate) maxDate = end;
      } catch (error) {
        console.warn('Invalid date format:', { startDate, endDate });
      }
    };

    wells.forEach(well => {
      // Проверяем состояния работы скважины
      well.events.forEach(event => {
        // Проверяем состояния работы
        event.operating_states?.forEach(state => {
          updateDateRange(state.startDate, state.endDate);
        });

        // Проверяем даты события
        updateDateRange(event.startDate, event.endDate);

        // Проверяем ресурсы
        if (event.resources && event.resources.length > 0) {
          event.resources.forEach(resource => {
            // Проверяем даты ресурса (от первой до последней операции)
            const firstOperation = resource.operations?.[0];
            const lastOperation = resource.operations?.[resource.operations.length - 1];
            if (firstOperation && lastOperation) {
              updateDateRange(firstOperation.startDate, lastOperation.endDate);
            }

            // Проверяем каждую операцию отдельно
            resource.operations?.forEach(operation => {
              updateDateRange(operation.startDate, operation.endDate);
            });
          });
        }
      });
    });

    // Если не нашли ни одной валидной даты, возвращаем текущий месяц
    if (!minDate || !maxDate) {
      const now = new Date();
      minDate = new Date(now.getFullYear(), now.getMonth(), 1);
      maxDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
