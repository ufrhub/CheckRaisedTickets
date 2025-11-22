import React, { useEffect, useRef, useState } from 'react';
import { useApiContext } from '../ApiContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Amenity.css';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import Loader from '../Components/Loader';

export const Amenity = () => {
    const {
        token, setToken,
        amenityID, setAmenityID,
    } = useApiContext();
    const [loading, setLoading] = useState(() => {
        if (!token || !amenityID) {
            return true;
        }
    });
    const [activeStartDate, setActiveStartDate] = useState(new Date());
    const minSelectableDate = new Date();
    minSelectableDate.setHours(0, 0, 0, 0);

    const setPropertiesReference = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token.value === null && amenityID.value === null) {
            const setPropertiesOnce = ({ mSource, mToken, mAmenityID }) => {
                if (!setPropertiesReference.current) {
                    setPropertiesReference.current = true;
                    if (mToken && mAmenityID) {
                        setToken({ source: mSource, value: mToken });
                        setAmenityID({ source: mSource, value: mAmenityID });
                        setLoading(false);
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

                        setPropertiesOnce({ mSource: "URL", mToken: apiToken, mAmenityID: amenityData });
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

                        setPropertiesOnce({ mSource: "postMessage", mToken: apiToken, mAmenityID: amenityData });
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

                        setPropertiesOnce({ mSource: "window.setToken", mToken: apiToken, mAmenityID: amenityData });
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
    }, [amenityID, setAmenityID, setToken, token.value]);

    const tileClassName = ({ date, view }) => {
        if (view !== "month") return null;

        const isSameMonth = date.getMonth() === activeStartDate.getMonth();
        const isToday = isSameDay(date, new Date());
        const isFuture = date > new Date();

        if (!isSameMonth) return null;
        if (isToday) return "today-border";
        if (isFuture) return "future-date";

        return null;
    };

    const onDateClick = (date) => {
        const formatted = format(date, 'yyyy-MM-dd');

        navigate(`/amenityslot/${token.value}/${amenityID.value}/${formatted}`);
    };

    return (
        <React.Fragment>
            {
                loading ? (
                    <Loader />
                ) :
                    (
                        <div className="container">
                            <Calendar
                                tileClassName={tileClassName}
                                onClickDay={onDateClick}
                                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                                minDate={minSelectableDate}
                            />

                            <div style={{ marginTop: '20px', padding: '10px', borderTop: '1px solid #eee' }}>
                                <p style={{ margin: '5px 0', wordBreak: 'break-all' }}>
                                    <strong>Token:</strong> {token?.value}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Amenity ID:</strong> {amenityID?.value}
                                </p>
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Source:</strong> {token?.source || amenityID?.source}
                                </p>
                            </div>
                        </div>
                    )
            }
        </React.Fragment>
    );
}
