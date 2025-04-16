type FormatDateResult = {
  short: string;
  full: string;
  start: string;
  end: string;
};

const DATE_FORMATS = {
  SHORT: {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  },
  FULL: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
} as const;

export const useDateFormatting = () => {
  const formatDateRange = (startDate: string | null, endDate: string | null): FormatDateResult => {
    if (!startDate || !endDate) {
      return { short: '-', full: 'Даты не указаны', start: '-', end: '-' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return {
      short: formatDateToString(start, end, DATE_FORMATS.SHORT),
      full: formatDateToString(start, end, DATE_FORMATS.FULL),
      start: start.toLocaleDateString('ru-RU', DATE_FORMATS.SHORT),
      end: end.toLocaleDateString('ru-RU', DATE_FORMATS.SHORT)
    };
  };

  const formatDateToString = (start: Date, end: Date, options: Intl.DateTimeFormatOptions): string => {
    const startStr = start.toLocaleDateString('ru-RU', options);
    const endStr = end.toLocaleDateString('ru-RU', options);

    if (options === DATE_FORMATS.FULL) {
      const startTime = start.toLocaleTimeString('ru-RU');
      const endTime = end.toLocaleTimeString('ru-RU');
      return `${startStr}, ${startTime} - ${endStr}, ${endTime}`;
    }

    return `${startStr} - ${endStr}`;
  };

  return {
    formatDateRange
  };
};
