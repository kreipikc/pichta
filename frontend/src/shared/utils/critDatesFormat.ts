export function critDatesFormat(dates: { date_from: string; date_to: string }): { date_from: string; date_to: string } {
    const { date_from, date_to } = dates;

    const formatDate = (dateString: string): string => {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}_${timePart}:00.000`;
    };

    return {
        date_from: formatDate(date_from),
        date_to: formatDate(date_to),
    };
}