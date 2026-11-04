import React, { useEffect, useRef, useState } from 'react';
import { useApiContext } from '../ApiContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Amenity.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import Loader from '../Components/Loader';

export const Amenity = () => {
    const {
        token, setToken,
        amenityID, setAmenityID,
        showBackButton, setShowBackButton,
    } = useApiContext();
    const [loading, setLoading] = useState(() => {
        if (!token.value || !amenityID.value) {
            return true;
        }
    });
    const [errorMessage, setErrorMessage] = useState(null);
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const [dateAvailability, setDateAvailability] = useState({});
    const [unavailableDate, setUnavailableDate] = useState(null);
    const minSelectableDate = new Date();
    minSelectableDate.setHours(0, 0, 0, 0);

    const setPropertiesReference = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token.value === null && amenityID.value === null && showBackButton.value === null) {
            const setPropertiesOnce = ({ mSource, mToken, mAmenityID, mShowBackButton }) => {
                if (!setPropertiesReference.current) {
                    setPropertiesReference.current = true;
                    if (mToken && mAmenityID) {
                        setToken({ source: mSource, value: mToken });
                        setAmenityID({ source: mSource, value: mAmenityID });
                        setLoading(false);
                    }

                    if (mShowBackButton) {
                        setShowBackButton({ source: mSource, value: mShowBackButton });
                    }

                } else {
                    console.warn(`Ignored token from ${mSource} because token is already set`);
                }
            };

            const queryParams = new URLSearchParams(window.location.search);
            const paramsData = queryParams.get("params");
            const handleParams = (params) => {
                try {
                    if (params) {
                        const decoded = decodeURIComponent(params);
                        const parsedData = JSON.parse(decoded);
                        const apiToken = parsedData.apiToken;
                        const amenityData = parsedData.amenity_id;
                        const isBackButtonVisible = parsedData.showBackButton;

                        setPropertiesOnce({ mSource: "URL", mToken: apiToken, mAmenityID: amenityData, mShowBackButton: isBackButtonVisible });
                    }
                } catch (error) {
                    console.warn("Ignoring non-JSON postMessage:", params.data);
                }
            }
            handleParams(paramsData);

            const handleMessage = (event) => {
                const message = event.data;

                try {
                    if (message && typeof message === "object" && "data" in message) {
                        const parsedData = JSON.parse(message.data);
                        const apiToken = parsedData.apiToken;
                        const amenityData = parsedData.amenity_id;
                        const isBackButtonVisible = parsedData.showBackButton;

                        setPropertiesOnce({ mSource: "postMessage", mToken: apiToken, mAmenityID: amenityData, mShowBackButton: isBackButtonVisible });
                    }
                } catch (error) {
                    console.warn("Ignoring non-JSON postMessage:", message);
                }
            };
            window.addEventListener("message", handleMessage);

            window.setToken = (receivedData) => {
                try {
                    if (receivedData && typeof receivedData === "object" && "data" in receivedData) {
                        const parsedData = JSON.parse(receivedData.data);
                        const apiToken = parsedData.apiToken;
                        const amenityData = parsedData.amenity_id;
                        const isBackButtonVisible = parsedData.showBackButton;

                        setPropertiesOnce({ mSource: "window.setToken", mToken: apiToken, mAmenityID: amenityData, mShowBackButton: isBackButtonVisible });
                    }
                } catch (error) {
                    console.warn("Ignoring non-JSON postMessage:", receivedData.data);
                }
            };

            return () => {
                window.removeEventListener("message", handleMessage);
                delete window.setToken;
            };
        }
    }, [amenityID, setAmenityID, setShowBackButton, setToken, showBackButton.value, token.value]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setErrorMessage(null);
            const fromDate = format(new Date(), 'yyyy-MM-dd');
            const url = `https://app.propkey.app/public/api/auth/get-amenity-date-availability?property_amenity_id=${amenityID.value}&from_date=${fromDate}`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                });

                const dates = response.data?.data?.dates || [];
                // Key each date's availability by "yyyy-MM-dd" for quick lookup per calendar tile
                const availabilityByDate = {};
                dates.forEach((item) => {
                    availabilityByDate[item.date] = item;
                });

                setDateAvailability(availabilityByDate);
            } catch (error) {
                console.error('Error fetching amenity date availability:', error);
                setDateAvailability({});
                // Show the API's own message (e.g. "Your session expired, Please login again")
                setErrorMessage(error?.response?.data?.message || 'Something went wrong while loading the availability. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (token.value !== null && amenityID.value !== null) {
            fetchData();
        }
    }, [amenityID.value, token.value]);

    const tileClassName = ({ date, view }) => {
        if (view !== "month") return null;

        const isSameMonth = date.getMonth() === activeStartDate.getMonth();
        const isToday = isSameDay(date, new Date());
        const isFuture = date > new Date();

        if (!isSameMonth) return isToday ? "today-border" : null;

        const classes = [];
        const availability = dateAvailability[format(date, 'yyyy-MM-dd')];

        // Dates outside the API's range get no availability colour
        if (availability) classes.push(availability.available ? "date-available" : "date-unavailable");

        if (isToday) classes.push("today-border");
        else if (isFuture) classes.push("future-date");

        return classes.length > 0 ? classes.join(" ") : null;
    };

    const onDateClick = (date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        const availability = dateAvailability[formatted];

        // Not available: stay on the calendar and show the API's message for that date
        if (availability && !availability.available) {
            setUnavailableDate(availability);
            return;
        }

        navigate(`/amenityslot/${token.value}/${amenityID.value}/${formatted}`, {
            state: {
                showBackButton: showBackButton.value
            }
        });
    };

    return (
        <React.Fragment>
            {
                loading ? (
                    <Loader />
                ) :
                    (
                        <div className="container">
                            {
                                errorMessage
                                    ?
                                    <div className="api-error-message">{errorMessage}</div>
                                    :
                                    <Calendar
                                        tileClassName={tileClassName}
                                        onClickDay={onDateClick}
                                        onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                                        minDate={minSelectableDate}
                                    />
                            }

                            {unavailableDate && (
                                <div className="availability-modal" onClick={() => setUnavailableDate(null)}>
                                    <div className="availability-modal-content" onClick={(e) => e.stopPropagation()}>
                                        <h3>Not Available</h3>
                                        <p>{unavailableDate.message || 'This date is not available for booking.'}</p>

                                        <div className="availability-modal-footer">
                                            <button onClick={() => setUnavailableDate(null)}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
            }
        </React.Fragment>
    );
}