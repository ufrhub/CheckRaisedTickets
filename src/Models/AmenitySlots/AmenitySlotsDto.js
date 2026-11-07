/**
 * Raw response shapes of `GET /api/auth/get-amenity-time-slots`, exactly as
 * the API sends them (snake_case). The shape of `data` depends on the
 * amenity's booking type, given by `data.time_slot` ("Hourly" or "Day").
 *
 * Type definitions only — convert to entities with AmenitySlotsMapper.
 */

/**
 * @typedef {Object} HourlySlotDto
 * @property {string} start_time               "HH:mm:ss"
 * @property {string} end_time                 "HH:mm:ss"
 * @property {boolean} available
 * @property {string|null} reason              e.g. "past_time"
 * @property {string} potential_end_datetime   "YYYY-MM-DD HH:mm:ss"
 * @property {boolean} spans_days
 * @property {number} max_occupancy
 * @property {number} current_occupancy
 * @property {number} remaining_seats
 */

/**
 * @typedef {Object} HourlySlotsDataDto
 * @property {string} date                     "YYYY-MM-DD"
 * @property {"Hourly"} time_slot
 * @property {number} duration_minutes
 * @property {string} amenity_title
 * @property {string} amenity_name
 * @property {string} available_from           "HH:mm:ss"
 * @property {string} available_to             "HH:mm:ss"
 * @property {number} max_duration_minutes
 * @property {string} max_duration_formatted   e.g. "5 Hr"
 * @property {boolean} requires_approval
 * @property {HourlySlotDto[]} slots
 */

/**
 * @typedef {Object} DayAvailabilityDto
 * @property {string} date                     "YYYY-MM-DD"
 * @property {number} used
 * @property {number} remaining
 * @property {boolean} full
 * @property {boolean} available
 * @property {string|null} reason              e.g. "Fully Booked"
 */

/**
 * @typedef {Object} DailySlotsDataDto
 * @property {string} date                     "YYYY-MM-DD"
 * @property {string} to_date                  "YYYY-MM-DD"
 * @property {"Day"} time_slot
 * @property {string} amenity_title
 * @property {string} amenity_name
 * @property {number} max_days
 * @property {number} total
 * @property {string|null} first_full_date     "YYYY-MM-DD"
 * @property {boolean} requires_approval
 * @property {DayAvailabilityDto[]} days
 */

/**
 * @typedef {Object} AmenitySlotsResponseDto
 * @property {boolean} success
 * @property {HourlySlotsDataDto|DailySlotsDataDto} data
 * @property {string} message
 */

export const TIME_SLOT_TYPE = Object.freeze({
  HOURLY: 'Hourly',
  DAY: 'Day',
});
