import { mapAmenitySlotsResponse, UnsupportedSlotTypeError } from './AmenitySlotsMapper';
import { SLOT_KIND } from './AmenitySlotsEntity';

const dailyResponse = {
  success: true,
  data: {
    date: '2026-11-11',
    to_date: '2026-12-11',
    time_slot: 'Day',
    amenity_title: 'Guest Suite',
    amenity_name: 'Guest Suite',
    max_days: 14,
    total: 1,
    first_full_date: '2026-11-12',
    requires_approval: true,
    days: [
      { date: '2026-11-11', used: 0, remaining: 1, full: false, available: true, reason: null },
      { date: '2026-11-12', used: 1, remaining: 0, full: true, available: false, reason: 'Fully Booked' },
      { date: '2026-12-11', used: 0, remaining: 1, full: false, available: true, reason: null },
    ],
  },
  message: 'Day availability retrieved successfully.',
};

const hourlyResponse = {
  success: true,
  data: {
    date: '2026-11-11',
    time_slot: 'Hourly',
    duration_minutes: 30,
    amenity_title: '2nd Floor Lounge',
    amenity_name: 'Lounge',
    available_from: '10:00:00',
    available_to: '22:00:00',
    max_duration_minutes: 300,
    max_duration_formatted: '5 Hr',
    requires_approval: true,
    slots: [
      {
        start_time: '10:00:00', end_time: '10:30:00', available: true, reason: null,
        potential_end_datetime: '2026-11-11 10:30:00', spans_days: false,
        max_occupancy: 50, current_occupancy: 0, remaining_seats: 50,
      },
      {
        start_time: '10:30:00', end_time: '11:00:00', available: false, reason: 'past_time',
        potential_end_datetime: '2026-11-11 11:00:00', spans_days: false,
        max_occupancy: 50, current_occupancy: 0, remaining_seats: 50,
      },
    ],
  },
  message: 'Time slots retrieved successfully.',
};

describe('mapAmenitySlotsResponse', () => {
  it('maps a Day response to a daily entity', () => {
    const entity = mapAmenitySlotsResponse(dailyResponse);

    expect(entity.kind).toBe(SLOT_KIND.DAILY);
    expect(entity).toMatchObject({
      date: '2026-11-11',
      toDate: '2026-12-11',
      amenityName: 'Guest Suite',
      maxDays: 14,
      total: 1,
      firstFullDate: '2026-11-12',
      requiresApproval: true,
    });
    expect(entity.days).toHaveLength(3);
    expect(entity.days[1]).toEqual({
      date: '2026-11-12', available: false, full: true, used: 1, remaining: 0, reason: 'Fully Booked',
    });
    expect(entity.slots).toBeUndefined();
  });

  it('maps an Hourly response to an hourly entity', () => {
    const entity = mapAmenitySlotsResponse(hourlyResponse);

    expect(entity.kind).toBe(SLOT_KIND.HOURLY);
    expect(entity).toMatchObject({
      amenityName: 'Lounge',
      maxDurationLabel: '5 Hr',
      durationMinutes: 30,
      availableFrom: '10:00:00',
      availableTo: '22:00:00',
    });
    expect(entity.slots).toHaveLength(2);
    expect(entity.slots[0]).toMatchObject({ startTime: '10:00:00', available: true, isPast: false, remainingSeats: 50 });
    expect(entity.slots[1].isPast).toBe(true);
    expect(entity.days).toBeUndefined();
  });

  it('falls back to the payload shape when time_slot is missing', () => {
    const { time_slot, ...data } = dailyResponse.data;
    expect(mapAmenitySlotsResponse({ data }).kind).toBe(SLOT_KIND.DAILY);
  });

  it('defaults missing lists to empty arrays', () => {
    const entity = mapAmenitySlotsResponse({ data: { date: '2026-11-11', time_slot: 'Hourly' } });
    expect(entity.slots).toEqual([]);
  });

  it('throws UnsupportedSlotTypeError for unknown types', () => {
    expect(() => mapAmenitySlotsResponse({ data: { time_slot: 'Weekly' } })).toThrow(UnsupportedSlotTypeError);
  });
});
