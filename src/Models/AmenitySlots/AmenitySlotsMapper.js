import { TIME_SLOT_TYPE } from './AmenitySlotsDto';
import {
  createHourlySlot,
  createHourlyAmenitySlots,
  createDayAvailability,
  createDailyAmenitySlots,
} from './AmenitySlotsEntity';

/** Thrown when the API returns a `time_slot` type the app doesn't handle. */
export class UnsupportedSlotTypeError extends Error {
  constructor(timeSlot) {
    super(`Unsupported amenity time slot type: ${timeSlot}`);
    this.name = 'UnsupportedSlotTypeError';
    this.timeSlot = timeSlot;
  }
}

/** @param {import('./AmenitySlotsDto').HourlySlotDto} dto */
export const mapHourlySlot = (dto) =>
  createHourlySlot({
    startTime: dto.start_time,
    endTime: dto.end_time,
    available: dto.available,
    reason: dto.reason ?? null,
    potentialEndDateTime: dto.potential_end_datetime ?? null,
    spansDays: dto.spans_days,
    maxOccupancy: dto.max_occupancy ?? null,
    currentOccupancy: dto.current_occupancy ?? null,
    remainingSeats: dto.remaining_seats ?? null,
  });

/** @param {import('./AmenitySlotsDto').DayAvailabilityDto} dto */
export const mapDayAvailability = (dto) =>
  createDayAvailability({
    date: dto.date,
    available: dto.available,
    full: dto.full,
    used: dto.used ?? 0,
    remaining: dto.remaining ?? 0,
    reason: dto.reason ?? null,
  });

/** @param {import('./AmenitySlotsDto').HourlySlotsDataDto} dto */
export const mapHourlyData = (dto) =>
  createHourlyAmenitySlots({
    date: dto.date,
    amenityName: dto.amenity_name ?? '',
    amenityTitle: dto.amenity_title ?? '',
    requiresApproval: dto.requires_approval,
    durationMinutes: dto.duration_minutes ?? null,
    availableFrom: dto.available_from ?? null,
    availableTo: dto.available_to ?? null,
    maxDurationMinutes: dto.max_duration_minutes ?? null,
    maxDurationLabel: dto.max_duration_formatted ?? null,
    slots: (dto.slots ?? []).map(mapHourlySlot),
  });

/** @param {import('./AmenitySlotsDto').DailySlotsDataDto} dto */
export const mapDailyData = (dto) =>
  createDailyAmenitySlots({
    date: dto.date,
    toDate: dto.to_date ?? null,
    amenityName: dto.amenity_name ?? '',
    amenityTitle: dto.amenity_title ?? '',
    requiresApproval: dto.requires_approval,
    maxDays: dto.max_days ?? null,
    total: dto.total ?? null,
    firstFullDate: dto.first_full_date ?? null,
    days: (dto.days ?? []).map(mapDayAvailability),
  });

/** Works out the booking type, falling back to the payload's shape. */
const resolveTimeSlot = (data) => {
  if (data.time_slot) return data.time_slot;
  if (Array.isArray(data.slots)) return TIME_SLOT_TYPE.HOURLY;
  if (Array.isArray(data.days)) return TIME_SLOT_TYPE.DAY;
  return undefined;
};

/**
 * Maps the full API response to the matching entity.
 * @param {import('./AmenitySlotsDto').AmenitySlotsResponseDto} responseDto
 * @returns {import('./AmenitySlotsEntity').AmenitySlots}
 * @throws {UnsupportedSlotTypeError}
 */
export const mapAmenitySlotsResponse = (responseDto) => {
  const data = responseDto?.data ?? {};
  const timeSlot = resolveTimeSlot(data);

  switch (timeSlot) {
    case TIME_SLOT_TYPE.HOURLY:
      return mapHourlyData(data);
    case TIME_SLOT_TYPE.DAY:
      return mapDailyData(data);
    default:
      throw new UnsupportedSlotTypeError(timeSlot);
  }
};
