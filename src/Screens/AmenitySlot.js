import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../Styles/AmenitySlot.css';
import { useApiContext } from '../ApiContext';
import axios from "axios";
import Loader from '../Components/Loader';
import { mapAmenitySlotsResponse, UnsupportedSlotTypeError } from '../Models/AmenitySlots/AmenitySlotsMapper';
import { SLOT_KIND } from '../Models/AmenitySlots/AmenitySlotsEntity';

export const AmenitySlot = () => {
  const { token, amenityID, date } = useParams();
  const location = useLocation();
  const showBackButton = location.state?.showBackButton;
  const { amenityData, setAmenityData, filteredAmenitySlot, setFilteredAmenitySlot } = useApiContext();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  /** 
    // Filter out the passed slots according to the time
    const filterUpcomingSlots = (slots, manualDate) => {
      const now = new Date();
      const pad = (num) => String(num).padStart(2, '0');
  
      const currentDateTimeStr =
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  
      return slots.filter((slot) => {
        let datePart = "";
  
        if (manualDate) {
          datePart = manualDate;
        } else if (slot.potential_end_datetime) {
          datePart = slot.potential_end_datetime.split(' ')[0];
        } else {
          return false;
        }
  
        const slotDateTimeStr = `${datePart} ${slot.start_time}`;
  
        return slotDateTimeStr > currentDateTimeStr;
      });
    };
  **/

  // Hourly: drop slots already in the past. Daily: show every day as returned.
  const getVisibleItems = (entity) => {
    if (entity.kind === SLOT_KIND.HOURLY) {
      return entity.slots.filter((slot) => !slot.isPast);
    }
    return entity.days;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMessage(null);
      const url = `https://app.propkey.app/public/api/auth/get-amenity-time-slots?property_amenity_id=${amenityID}&date=${date}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const entity = mapAmenitySlotsResponse(response.data);
        setAmenityData(entity);
        setFilteredAmenitySlot(getVisibleItems(entity));
      } catch (error) {
        console.error('Error fetching amenity slots:', error);
        // Clear any slots left over from a previous successful load
        setAmenityData(null);
        setFilteredAmenitySlot([]);
        if (error instanceof UnsupportedSlotTypeError) {
          setErrorMessage("This amenity's booking type isn't supported yet.");
        } else {
          // Show the API's own message (e.g. "Your session expired, Please login again")
          setErrorMessage(error?.response?.data?.message || 'Something went wrong while loading the slots. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token && amenityID && date) {
      fetchData();
    }
  }, [amenityID, date, setAmenityData, setFilteredAmenitySlot, token]);

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month}-${day}-${year}`;
  }

  // Helper to format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';

    // Convert 24h to 12h format
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'

    return `${h}:${minutes} ${ampm}`;
  };

  const isDaily = amenityData?.kind === SLOT_KIND.DAILY;

  const renderHourlySlot = (slot, index) => (
    <button
      key={index}
      className={`slot-card ${slot.available ? 'available' : 'unavailable'}`}
      disabled={!slot.available}
    >
      <div className="slot-time">
        {formatTime(slot.startTime)}
      </div>
      <div className="slot-status">
        {slot.available ? (
          <span className="status-text success">Available</span>
        ) : (
          <span className="status-text error">
            {formatReason(slot.reason)}
          </span>
        )}
      </div>
    </button>
  );

  const renderDayCard = (day) => (
    <button
      key={day.date}
      className={`slot-card day-card ${day.available ? 'available' : 'unavailable'}`}
      disabled={!day.available}
    >
      <div className="slot-time">
        {formatDate(day.date)}
      </div>
      <div className="slot-status">
        {day.available ? (
          <span className="status-text success">
            Available<span className="day-remaining"> · {day.remaining} remaining</span>
          </span>
        ) : (
          <span className="status-text error">
            {formatReason(day.reason) || 'Unavailable'}
          </span>
        )}
      </div>
    </button>
  );

  // Helper to clean up the reason text
  const formatReason = (reason) => {
    if (!reason) return "";
    return reason.replace(/_/g, " ");
  };

  return (
    <React.Fragment>
      {
        loading ? (
          <Loader />
        ) : (
          <div className="amenity-slot container">
            {/* Header Section */}
            <header className="slot-header">
              <div className="header-section start">
                {showBackButton && (
                  <button className="back-btn" onClick={() => navigate(-1)}>
                    &#8592; Back
                  </button>
                )}
              </div>

              <div className="header-section center">
                <h2>{amenityData?.amenity_name}</h2>
                <p className="slot-date">
                  Selected Date: <strong>{formatDate(date) || formatDate(amenityData?.date)}</strong>
                </p>
              </div>

              <div className="header-section end">
                {amenityData && (
                  <div className="slot-info-badge">
                    {isDaily ? (
                      <span>Max Stay: {amenityData.maxDays} {amenityData.maxDays === 1 ? 'day' : 'days'}</span>
                    ) : (
                      <span>Max Duration: {amenityData.maxDurationLabel}</span>
                    )}
                  </div>
                )}
              </div>
            </header>

            {/* Slot Container Section */}
            <div className="slot-container-section">
              {
                errorMessage
                  ?
                  <div className="slot-error-message">{errorMessage}</div>
                  :
                  filteredAmenitySlot &&
                  filteredAmenitySlot.length > 0
                  ?
                  (isDaily
                    ? filteredAmenitySlot.map(renderDayCard)
                    : filteredAmenitySlot.map(renderHourlySlot))
                  :
                  <div>{isDaily ? 'No Dates Available' : 'No Slots Available'}</div>
              }
            </div>

            {!errorMessage && (
              <div style={{ textAlign: "center", margin: "30px 0" }}>
                {isDaily ? 'All Dates Loaded.' : 'All Slots Loaded.'}
              </div>
            )}
          </div>
        )
      }
    </React.Fragment>
  )
}