/**
 * App-facing models for amenity slots (camelCase). `kind` tells the UI which
 * variant it has. Lists always default to [] so missing fields can't crash
 * the screen.
 */

export const SLOT_KIND = Object.freeze({
  HOURLY: 'hourly',
  DAILY: 'daily',
});

/**
 * @typedef {Object} HourlySlot
 * @property {string} startTime
 * @property {string} endTime
 * @property {boolean} available
 * @property {string|null} reason
 * @property {boolean} isPast
 * @property {string|null} potentialEndDateTime
 * @property {boolean} spansDays
 * @property {number|null} maxOccupancy
 * @property {number|null} currentOccupancy
 * @property {number|null} remainingSeats
 */

/** @returns {HourlySlot} */
export const createHourlySlot = ({
  startTime,
  endTime,
  available = false,
  reason = null,
  potentialEndDateTime = null,
  spansDays = false,
  maxOccupancy = null,
  currentOccupancy = null,
  remainingSeats = null,
}) => ({
  startTime,
  endTime,
  available: Boolean(available),
  reason,
  isPast: reason === 'past_time',
  potentialEndDateTime,
  spansDays: Boolean(spansDays),
  maxOccupancy,
  currentOccupancy,
  remainingSeats,
});

/**
 * @typedef {Object} HourlyAmenitySlots
 * @property {"hourly"} kind
 * @property {string} date
 * @property {string} amenityName
 * @property {string} amenityTitle
 * @property {boolean} requiresApproval
 * @property {number|null} durationMinutes
 * @property {string|null} availableFrom
 * @property {string|null} availableTo
 * @property {number|null} maxDurationMinutes
 * @property {string|null} maxDurationLabel
 * @property {HourlySlot[]} slots
 */

/** @returns {HourlyAmenitySlots} */
export const createHourlyAmenitySlots = ({
  date,
  amenityName = '',
  amenityTitle = '',
  requiresApproval = false,
  durationMinutes = null,
  availableFrom = null,
  availableTo = null,
  maxDurationMinutes = null,
  maxDurationLabel = null,
  slots = [],
}) => ({
  kind: SLOT_KIND.HOURLY,
  date,
  amenityName,
  amenityTitle,
  requiresApproval: Boolean(requiresApproval),
  durationMinutes,
  availableFrom,
  availableTo,
  maxDurationMinutes,
  maxDurationLabel,
  slots,
});

/**
 * @typedef {Object} DayAvailability
 * @property {string} date
 * @property {boolean} available
 * @property {boolean} full
 * @property {number} used
 * @property {number} remaining
 * @property {string|null} reason
 */

/** @returns {DayAvailability} */
export const createDayAvailability = ({
  date,
  available = false,
  full = false,
  used = 0,
  remaining = 0,
  reason = null,
}) => ({
  date,
  available: Boolean(available),
  full: Boolean(full),
  used,
  remaining,
  reason,
});

/**
 * @typedef {Object} DailyAmenitySlots
 * @property {"daily"} kind
 * @property {string} date
 * @property {string|null} toDate
 * @property {string} amenityName
 * @property {string} amenityTitle
 * @property {boolean} requiresApproval
 * @property {number|null} maxDays
 * @property {number|null} total
 * @property {string|null} firstFullDate
 * @property {DayAvailability[]} days
 */

/** @returns {DailyAmenitySlots} */
export const createDailyAmenitySlots = ({
  date,
  toDate = null,
  amenityName = '',
  amenityTitle = '',
  requiresApproval = false,
  maxDays = null,
  total = null,
  firstFullDate = null,
  days = [],
}) => ({
  kind: SLOT_KIND.DAILY,
  date,
  toDate,
  amenityName,
  amenityTitle,
  requiresApproval: Boolean(requiresApproval),
  maxDays,
  total,
  firstFullDate,
  days,
});

/** @typedef {HourlyAmenitySlots|DailyAmenitySlots} AmenitySlots */
