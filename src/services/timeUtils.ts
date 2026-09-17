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
