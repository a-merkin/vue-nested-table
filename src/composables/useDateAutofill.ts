import { addDays, parse, format, isValid } from 'date-fns';
import { ru } from 'date-fns/locale';

export function useDateAutofill() {
  const detectPattern = (dates: string[]): 'day' | 'week' | 'month' | 'year' | null => {
    if (dates.length < 2) return null;

    const parsedDates = dates
      .map(date => parse(date, 'yyyy-MM-dd', new Date()))
      .filter(isValid);

    if (parsedDates.length < 2) return null;

    const diffs: number[] = [];
    for (let i = 1; i < parsedDates.length; i++) {
      const diff = parsedDates[i].getTime() - parsedDates[i - 1].getTime();
      diffs.push(diff);
    }

    // Check if all differences are the same
    const isUniform = diffs.every(diff => diff === diffs[0]);
    if (!isUniform) return null;

    const daysDiff = diffs[0] / (1000 * 60 * 60 * 24);

    if (daysDiff === 1) return 'day';
    if (daysDiff === 7) return 'week';
    if (daysDiff === 30) return 'month';
    if (daysDiff === 365) return 'year';

    return null;
  };

  const generateNextDates = (
    startDate: string,
    pattern: 'day' | 'week' | 'month' | 'year',
    count: number
  ): string[] => {
    const dates: string[] = [];
    let currentDate = parse(startDate, 'yyyy-MM-dd', new Date());

    for (let i = 0; i < count; i++) {
      switch (pattern) {
        case 'day':
          currentDate = addDays(currentDate, 1);
          break;
        case 'week':
          currentDate = addDays(currentDate, 7);
          break;
        case 'month':
          currentDate = addDays(currentDate, 30);
          break;
        case 'year':
          currentDate = addDays(currentDate, 365);
          break;
      }
      dates.push(format(currentDate, 'yyyy-MM-dd'));
    }

    return dates;
  };

  const autofillDates = (selectedDates: string[], targetCount: number): string[] => {
    const pattern = detectPattern(selectedDates);
    if (!pattern) {
      // If no pattern detected, use the last date and increment by 1 day
      const lastDate = selectedDates[selectedDates.length - 1];
      return generateNextDates(lastDate, 'day', targetCount - selectedDates.length);
    }

    const lastDate = selectedDates[selectedDates.length - 1];
    return generateNextDates(lastDate, pattern, targetCount - selectedDates.length);
  };

  return {
    detectPattern,
    generateNextDates,
    autofillDates
  };
} 