import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../Styles/AmenitySlot.css';
import { useApiContext } from '../ApiContext';
import axios from "axios";
import Loader from '../Components/Loader';

export const AmenitySlot = () => {
  const { token, amenityID, date } = useParams();
  const location = useLocation();
  const showBackButton = location.state?.showBackButton;
  const { amenityData, setAmenityData, filteredAmenitySlot, setFilteredAmenitySlot } = useApiContext();
  const [loading, setLoading] = useState(true);

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

  // Filter out the passed slots according to the reason `Past Time`
  const filterUpcomingSlots = (slots) => {
    return slots.filter((slot) => slot.reason !== "past_time");
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const url = `https://app.propkey.app/public/api/auth/get-amenity-time-slots?property_amenity_id=${amenityID}&date=${date}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const result = response.data.data;
        // const upcomingSlots = filterUpcomingSlots(result.slots, result.date);
        const upcomingSlots = filterUpcomingSlots(result.slots);
        setAmenityData(result);
        setFilteredAmenitySlot(upcomingSlots);
      } catch (error) {
        console.error('Error fetching technicians data:', error);
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
          <div className="container slot-container">
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
                <div className="slot-info-badge">
                  <span>Max Duration: {amenityData?.max_duration_formatted}</span>
                </div>
              </div>
            </header>

            {/* Grid Section */}
            <div className="slot-grid">
              {
                filteredAmenitySlot &&
                  filteredAmenitySlot.length > 0
                  ?
                  filteredAmenitySlot?.map((slot, index) => (
                    <button
                      key={index}
                      className={`slot-card ${slot.available ? 'available' : 'unavailable'}`}
                      disabled={!slot.available}
                    >
                      <div className="slot-time">
                        {formatTime(slot.start_time)}
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
                  ))
                  :
                  <div>No Slots Available</div>
              }
            </div>
          </div>
        )
      }
    </React.Fragment>
  )
}
