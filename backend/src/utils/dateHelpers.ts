import { format, differenceInDays, isPast, addDays, parseISO } from 'date-fns';

export const getDaysUntil = (date: Date | string): number => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return differenceInDays(d, new Date());
};

export const isExpired = (date: Date | string): boolean => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return isPast(d);
};

export const isExpiringSoon = (date: Date | string, days = 30): boolean => {
    const diff = getDaysUntil(date);
    return diff >= 0 && diff <= days;
};

export const formatDateForDB = (date: Date): string => {
    return date.toISOString();
};
