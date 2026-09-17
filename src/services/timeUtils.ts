/**
 * Time calculations and solar position utilities
 */

export function getLocalTimeDetails(timezone: string, baseDate: Date = new Date(), format24h: boolean = true) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: !format24h,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });

    const parts = formatter.formatToParts(baseDate);
    const partMap: Record<string, string> = {};
    for (const p of parts) {
      partMap[p.type] = p.value;
    }

    // 24-hour hour for day/night logic
    const hour24Formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    const hour24 = parseInt(hour24Formatter.format(baseDate), 10);

    const hourStr = partMap.hour ? partMap.hour.padStart(2, '0') : '00';
    const minuteStr = partMap.minute ? partMap.minute.padStart(2, '0') : '00';
    const secondStr = partMap.second ? partMap.second.padStart(2, '0') : '00';
    const period = partMap.dayPeriod || '';

    const timeString = format24h ? `${hourStr}:${minuteStr}` : `${hourStr}:${minuteStr} ${period}`.trim();
    const fullTimeString = format24h ? `${hourStr}:${minuteStr}:${secondStr}` : `${hourStr}:${minuteStr}:${secondStr} ${period}`.trim();
    const dateString = `${partMap.weekday}, ${partMap.month} ${partMap.day}`;

    // Calculate UTC offset
    const offsetStr = getUtcOffsetString(timezone, baseDate);

    // Day or Night (Standard: 6 AM to 7 PM is day)
    const isDay = hour24 >= 6 && hour24 < 19;

    return {
      hour24,
      hourStr,
      minuteStr,
      secondStr,
      period,
      timeString,
      fullTimeString,
      dateString,
      offsetStr,
      isDay,
    };
  } catch (error) {
    console.error('Error formatting time for timezone:', timezone, error);
    return {
      hour24: 12,
      hourStr: '12',
      minuteStr: '00',
      secondStr: '00',
      period: 'PM',
      timeString: '12:00',
      fullTimeString: '12:00:00',
      dateString: 'Today',
      offsetStr: 'UTC+0',
      isDay: true,
    };
  }
}

/**
 * Returns formatted offset like "UTC+9", "UTC-8", "UTC+0"
 */
export function getUtcOffsetString(timezone: string, date: Date = new Date()): string {
  try {
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const diffHours = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    const rounded = Math.round(diffHours * 10) / 10;
    
    if (rounded === 0) return 'UTC+0';
    const sign = rounded > 0 ? '+' : '';
    return `UTC${sign}${rounded}`;
  } catch (e) {
    return 'UTC+0';
  }
}

/**
 * Calculate Solar Subsolar point (latitude, longitude where the sun is directly overhead)
 * used to render the solar terminator on the world map.
 */
export function getSubsolarPoint(now: Date = new Date()) {
  // Day of year
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  // Solar declination (approximate in degrees)
  const declination = -23.44 * Math.cos((2 * Math.PI / 365) * (dayOfYear + 10));

  // Subsolar longitude in degrees
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  // At 12:00 UTC, sun is at longitude 0
  let subsolarLon = (12 - utcHours) * 15;
  while (subsolarLon > 180) subsolarLon -= 360;
  while (subsolarLon < -180) subsolarLon += 360;

  return {
    latitude: declination,
    longitude: subsolarLon,
  };
}

/**
 * Generate night polygon path for a world map SVG with width 800 and height 400
 * Equirectangular projection coordinates:
 * lon: [-180, 180] -> x: [0, 800]
 * lat: [90, -90]   -> y: [0, 400]
 */
export function generateTerminatorSvgPath(now: Date = new Date(), width = 800, height = 400): string {
  const { latitude: dec, longitude: subLon } = getSubsolarPoint(now);
  const decRad = (dec * Math.PI) / 180;

  const points: { x: number; y: number }[] = [];
  const steps = 72; // 5 degree steps for smoothness

  for (let i = 0; i <= steps; i++) {
    const lonDeg = -180 + (i / steps) * 360;
    const hourAngle = ((lonDeg - subLon) * Math.PI) / 180;
    
    // Solar zenith angle = 90 deg -> tan(lat) = -cos(hourAngle) / tan(dec)
    let latRad = 0;
    if (Math.abs(Math.tan(decRad)) > 0.0001) {
      latRad = Math.atan(-Math.cos(hourAngle) / Math.tan(decRad));
    }
    const latDeg = (latRad * 180) / Math.PI;

    // Convert to SVG x, y
    const x = ((lonDeg + 180) / 360) * width;
    const y = ((90 - latDeg) / 180) * height;
    points.push({ x, y });
  }

  // Determine whether North or South pole is currently in night
  // If dec > 0 (Northern summer), South pole (lat -90, y = height) is in night
  // If dec < 0 (Northern winter), North pole (lat +90, y = 0) is in night
  const southInNight = dec > 0;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  if (southInNight) {
    path += ` L ${width} ${height} L 0 ${height} Z`;
  } else {
    path += ` L ${width} 0 L 0 0 Z`;
  }

  return path;
}

export interface TimeDifferenceResult {
  hoursDiff: number;
  minutesDiff: number;
  totalMinutes: number;
  direction: 'ahead' | 'behind' | 'same';
  formattedDiff: string;
  dayRelation: 'same day' | 'next day (tomorrow)' | 'previous day (yesterday)';
  summary: string;
}

/**
 * Calculates exact time difference between Timezone B relative to Timezone A
 * e.g., if tzA is Lagos (UTC+1) and tzB is Tokyo (UTC+9), returns +8 hours ahead
 */
export function getTimeDifference(
  timezoneA: string,
  timezoneB: string,
  baseDate: Date = new Date()
): TimeDifferenceResult {
  try {
    const timeA = new Date(baseDate.toLocaleString('en-US', { timeZone: timezoneA }));
    const timeB = new Date(baseDate.toLocaleString('en-US', { timeZone: timezoneB }));

    const diffMs = timeB.getTime() - timeA.getTime();
    const totalMinutes = Math.round(diffMs / (1000 * 60));
    const totalHours = totalMinutes / 60;

    const absMinutes = Math.abs(totalMinutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    let direction: 'ahead' | 'behind' | 'same' = 'same';
    if (totalMinutes > 0) direction = 'ahead';
    else if (totalMinutes < 0) direction = 'behind';

    let formattedDiff = '';
    if (direction === 'same') {
      formattedDiff = 'Same Time';
    } else {
      const sign = direction === 'ahead' ? '+' : '-';
      formattedDiff = `${sign}${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim();
    }

    // Day relationship
    const dayA = timeA.getDate();
    const dayB = timeB.getDate();
    let dayRelation: 'same day' | 'next day (tomorrow)' | 'previous day (yesterday)' = 'same day';

    if (dayB > dayA || (dayA > 25 && dayB === 1)) {
      dayRelation = 'next day (tomorrow)';
    } else if (dayB < dayA || (dayB > 25 && dayA === 1)) {
      dayRelation = 'previous day (yesterday)';
    }

    let summary = '';
    if (direction === 'same') {
      summary = 'Both locations share the exact same local time';
    } else {
      const timeStr = `${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` and ${mins} min${mins !== 1 ? 's' : ''}` : ''}`;
      summary = `${timeStr} ${direction}`;
    }

    return {
      hoursDiff: totalHours,
      minutesDiff: mins,
      totalMinutes,
      direction,
      formattedDiff,
      dayRelation,
      summary,
    };
  } catch (error) {
    console.error('Failed to calculate time difference', error);
    return {
      hoursDiff: 0,
      minutesDiff: 0,
      totalMinutes: 0,
      direction: 'same',
      formattedDiff: '0h',
      dayRelation: 'same day',
      summary: 'Same time',
    };
  }
}

export interface HourSlot {
  hourA: number;
  hourB: number;
  hourAStr: string;
  hourBStr: string;
  statusA: 'work' | 'awake' | 'sleep';
  statusB: 'work' | 'awake' | 'sleep';
  isOverlap: boolean; // Both awake
  isWorkOverlap: boolean; // Both in work hours (9-17)
}

/**
 * Generates 24 hourly comparison slots between timezone A and timezone B
 */
export function getComparisonTimeline(
  timezoneA: string,
  timezoneB: string,
  baseDate: Date = new Date()
): { slots: HourSlot[]; bestMeetingWindow: string | null } {
  const diff = getTimeDifference(timezoneA, timezoneB, baseDate);
  const slots: HourSlot[] = [];
  const workOverlaps: number[] = [];
  const awakeOverlaps: number[] = [];

  const getStatus = (hour: number): 'work' | 'awake' | 'sleep' => {
    if (hour >= 9 && hour < 17) return 'work';
    if (hour >= 7 && hour < 23) return 'awake';
    return 'sleep';
  };

  for (let hA = 0; hA < 24; hA++) {
    // Calculate hour in B
    let hB = Math.round(hA + diff.hoursDiff);
    while (hB < 0) hB += 24;
    while (hB >= 24) hB -= 24;

    const statusA = getStatus(hA);
    const statusB = getStatus(hB);

    const isWorkOverlap = statusA === 'work' && statusB === 'work';
    const isOverlap = statusA !== 'sleep' && statusB !== 'sleep';

    if (isWorkOverlap) workOverlaps.push(hA);
    if (isOverlap) awakeOverlaps.push(hA);

    slots.push({
      hourA: hA,
      hourB: hB,
      hourAStr: `${hA.toString().padStart(2, '0')}:00`,
      hourBStr: `${hB.toString().padStart(2, '0')}:00`,
      statusA,
      statusB,
      isOverlap,
      isWorkOverlap,
    });
  }

  let bestMeetingWindow: string | null = null;
  if (workOverlaps.length > 0) {
    const start = workOverlaps[0];
    const end = workOverlaps[workOverlaps.length - 1] + 1;
    bestMeetingWindow = `${start}:00 – ${end}:00 (Business overlap)`;
  } else if (awakeOverlaps.length > 0) {
    const start = awakeOverlaps[0];
    const end = awakeOverlaps[awakeOverlaps.length - 1] + 1;
    bestMeetingWindow = `${start}:00 – ${end}:00 (Waking overlap)`;
  }

  return { slots, bestMeetingWindow };
}

