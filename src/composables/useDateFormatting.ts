type FormatDateResult = {
  short: string;
  full: string;
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
      return { short: '-', full: 'Даты не указаны' };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return {
      short: formatDateToString(start, end, DATE_FORMATS.SHORT),
      full: formatDateToString(start, end, DATE_FORMATS.FULL)
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
