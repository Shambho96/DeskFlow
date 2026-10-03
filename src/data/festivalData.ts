export interface HotelEvent {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  category: 'FESTIVAL' | 'LONG_WEEKEND' | 'HOLIDAY' | 'LOCAL_EVENT';
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  rateSurgeRecommended: string;
  forecastOccupancy: number;
  description: string;
  checklist: string[];
  badgeColor: string;
  isLiveApi?: boolean;
}

export interface NagerHolidayItem {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  types: string[];
}

function parseDateKeyToISO(dateKey: string): string {
  // Converts keys like "October 2, 2026, Friday" or "January 26, 2026, Monday" into "2026-10-02"
  const parts = dateKey.split(',');
  if (parts.length >= 2) {
    const datePart = parts[0].trim() + ',' + parts[1].trim();
    const parsedDate = new Date(datePart);
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }
  return '';
}

export async function fetchLivePublicHolidays(year: number = 2026, countryCode: string = 'IN'): Promise<HotelEvent[]> {
  if (countryCode === 'IN') {
    try {
      const response = await fetch(`https://jayantur13.github.io/calendar-bharat/calendar/${year}.json`);
      if (response.ok) {
        const data = await response.json();
        const yearData = data[String(year)];

        if (yearData) {
          const events: HotelEvent[] = [];
          let eventIdx = 1;

          Object.keys(yearData).forEach(monthKey => {
            const monthObj = yearData[monthKey];
            if (monthObj && typeof monthObj === 'object') {
              Object.keys(monthObj).forEach(dateKey => {
                const item = monthObj[dateKey];
                const isoDate = parseDateKeyToISO(dateKey);
                if (!isoDate || !item || !item.event) return;

                const d = new Date(`${isoDate}T00:00:00`);
                const dayOfWeek = d.getDay();
                const isLongWeekend = dayOfWeek === 1 || dayOfWeek === 5 || dayOfWeek === 0 || dayOfWeek === 6;

                const eventNameLower = item.event.toLowerCase();
                const isMajorFestival =
                  item.type?.toLowerCase().includes('festival') ||
                  eventNameLower.includes('diwali') ||
                  eventNameLower.includes('dussehra') ||
                  eventNameLower.includes('navratri') ||
                  eventNameLower.includes('republic') ||
                  eventNameLower.includes('independence') ||
                  eventNameLower.includes('gandhi') ||
                  eventNameLower.includes('holi') ||
                  eventNameLower.includes('eid') ||
                  eventNameLower.includes('pongal');

                const category: HotelEvent['category'] = isMajorFestival ? 'FESTIVAL' : isLongWeekend ? 'LONG_WEEKEND' : 'HOLIDAY';
                const impactLevel: HotelEvent['impactLevel'] = isMajorFestival ? 'CRITICAL' : isLongWeekend ? 'HIGH' : 'MEDIUM';
                const rateSurgeRecommended = isMajorFestival ? '+40%' : isLongWeekend ? '+30%' : '+20%';
                const forecastOccupancy = isMajorFestival ? 98 : isLongWeekend ? 92 : 85;

                const badgeColor = isMajorFestival
                  ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
                  : isLongWeekend
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';

                events.push({
                  id: `in-api-${isoDate}-${eventIdx++}`,
                  name: item.event,
                  startDate: isoDate,
                  endDate: isoDate,
                  category,
                  impactLevel,
                  rateSurgeRecommended,
                  forecastOccupancy,
                  description: `${item.type || 'Official Indian Holiday/Festival'}. ${item.extras || ''}`,
                  checklist: [],
                  badgeColor,
                  isLiveApi: true
                });
              });
            }
          });

          if (events.length > 0) {
            return events.sort((a, b) => a.startDate.localeCompare(b.startDate));
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching Indian live holiday API:', err);
    }
    return [];
  }

  // Standard Nager.Date API fetcher for other countries
  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
    if (!response.ok) throw new Error(`API returned status ${response.status}`);
    const data: NagerHolidayItem[] = await response.json();

    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((item, index) => {
      const holidayDate = new Date(`${item.date}T00:00:00`);
      const dayOfWeek = holidayDate.getDay();
      const isLongWeekend = dayOfWeek === 1 || dayOfWeek === 5 || dayOfWeek === 0 || dayOfWeek === 6;

      const category: HotelEvent['category'] = isLongWeekend ? 'LONG_WEEKEND' : 'HOLIDAY';
      const impactLevel: HotelEvent['impactLevel'] = isLongWeekend ? 'CRITICAL' : 'HIGH';
      const rateSurgeRecommended = isLongWeekend ? '+35%' : '+25%';
      const forecastOccupancy = isLongWeekend ? 95 : 88;

      const badgeColor = isLongWeekend
        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
        : 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';

      return {
        id: `api-${item.date}-${index}`,
        name: item.name || item.localName,
        startDate: item.date,
        endDate: item.date,
        category,
        impactLevel,
        rateSurgeRecommended,
        forecastOccupancy,
        description: `Official public holiday (${item.countryCode}).`,
        checklist: [],
        badgeColor,
        isLiveApi: true
      };
    });
  } catch (error) {
    console.warn('Error fetching public holiday API:', error);
    return [];
  }
}

export const getUpcomingEventsFromList = (
  eventsList: HotelEvent[],
  currentDateStr?: string
): (HotelEvent & { daysUntil: number; statusText: string })[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = currentDateStr || `${year}-${month}-${day}`;

  const todayDate = new Date(`${todayStr}T00:00:00`);

  return eventsList
    .filter(evt => evt.endDate >= todayStr)
    .map(evt => {
      const startDate = new Date(`${evt.startDate}T00:00:00`);
      const diffTime = startDate.getTime() - todayDate.getTime();
      const daysUntil = Math.round(diffTime / (1000 * 3600 * 24));

      let statusText = `In ${daysUntil} days`;
      if (daysUntil === 0) statusText = "Starts Today!";
      else if (daysUntil === 1) statusText = "Tomorrow!";
      else if (daysUntil < 0) statusText = "Ongoing Event";

      return {
        ...evt,
        daysUntil,
        statusText
      };
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
};
