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
  const { amenityData, setAmenityData } = useApiContext();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

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
        setAmenityData(result);
      } catch (error) {
        console.error('Error fetching technicians data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && amenityID && date) {
      fetchData();
    }
  }, [amenityID, date, setAmenityData, token]);

  // Helper to cut off seconds (05:00:00 -> 05:00)
  const formatTime = (timeStr) => timeStr.slice(0, 5);

  // Helper to clean up the reason text
  const formatReason = (reason) => {
    if (!reason) return "";
    return reason.replace(/_/g, " ").replace("would ", "");
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
              <div className="header-left">
                {
                  showBackButton ?
                    <button className="back-btn" onClick={() => navigate(-1)}>
                      &#8592; Back
                    </button>
                    :
                    null
                }

                <div className="header-text">
                  <h2>{amenityData?.amenity_name}</h2>
                  <p className="slot-date">
                    Selected Date: <strong>{date || amenityData?.date}</strong>
                  </p>
                </div>
              </div>

              <div className="slot-info-badge">
                <span>Max Duration: {amenityData?.max_duration_formatted}</span>
              </div>
            </header>

            {/* Grid Section */}
            <div className="slot-grid">
              {amenityData?.slots?.map((slot, index) => (
                <button
                  key={index}
                  className={`slot-card ${slot.available ? 'available' : 'unavailable'}`}
                  disabled={!slot.available}
                >
                  <div className="slot-time">
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
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
              ))}
            </div>
          </div>
        )
      }
    </React.Fragment>
  )
}
