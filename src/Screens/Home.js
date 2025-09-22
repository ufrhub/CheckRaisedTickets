import React, { useEffect, useRef, useState } from 'react';
import { useApiContext } from '../ApiContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Home.css';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';
import Loader from '../Components/Loader';

const customStyles = {
    control: (base) => ({
        ...base,
        borderRadius: 8,
        padding: '2px 4px',
        borderColor: '#ccc',
        boxShadow: 'none',
        ':hover': {
            borderColor: '#007bff'
        },
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
    }),
};

// Helper function - handles YYYY-MM-DD, or full ISO like 2025-09-23T00:00:00Z
const toLocalMidnight = (dateStr) => {
    if (!dateStr) return null;

    // 1) Plain YYYY-MM-DD -> explicit local midnight
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    }

    // 2) ISO with timezone info (Z or +hh:mm / -hh:mm) -> preserve server's UTC date
    if (/T.*(Z|[+-]\d{2}:\d{2})$/.test(dateStr)) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed)) {
            // use UTC fields so a "2025-09-23T00:00:00Z" remains 2025-09-23 for everyone
            return new Date(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate());
        }
    }

    // 3) Fallback: parse and normalize to local midnight
    const parsed = new Date(dateStr);
    if (!isNaN(parsed)) {
        return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    // final fallback: try manual split
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
};

export default function Home() {
    const {
        token, setToken,
        dropdownData, setDropdownData,
        tickets, setTickets,
        role, setRole,
        highlightDates, setHighlightDates,
        selectedOption, setSelectedOption,
    } = useApiContext();
    const [loading, setLoading] = useState(true);
    const [activeStartDate, setActiveStartDate] = useState(new Date())

    const setPropertiesReference = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (token.value === null && dropdownData === null) {
            const setPropertiesOnce = ({ mSource, mToken, mDropdownData }) => {
                if (!setPropertiesReference.current) {
                    setPropertiesReference.current = true;
                    if (mToken) {
                        setToken({ source: mSource, value: mToken });
                    }

                    if (Array.isArray(mDropdownData) && mDropdownData.length > 0) {
                        setDropdownData(mDropdownData);
                        setSelectedOption({
                            label: mDropdownData[0].name,
                            value: mDropdownData[0].id
                        });
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
                        const dropdownDataResult = parsedData.result;

                        setPropertiesOnce({ mSource: "URL", mToken: apiToken, mDropdownData: dropdownDataResult });
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
                        const dropdownDataResult = parsedData.result;

                        setPropertiesOnce({ mSource: "postMessage", mToken: apiToken, mDropdownData: dropdownDataResult });
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
                        const dropdownDataResult = parsedData.result;

                        setPropertiesOnce({ mSource: "window.setToken", mToken: apiToken, mDropdownData: dropdownDataResult });
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
    }, [dropdownData, setDropdownData, setSelectedOption, setToken, token.value]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const url = `https://app.propkey.app/public/api/auth/maintenance-request-supervisor-calendar-val/${selectedOption.value}`;
            // const url = `https://app.propkey.app/api/auth/maintenance-request-supervisor-calendar/${selectedOption.value}`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                });
                // const response = await axios.get(url);

                const result = response.data?.result;
                const role = response.data?.role;
                const dateKeys = Object.keys(result);
                const dateObjects = dateKeys.map(dateString => toLocalMidnight(dateString));

                setTickets(result);
                setRole(role)
                setHighlightDates(dateObjects);
            } catch (error) {
                console.error('Error fetching maintenance data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (token.value !== null && ((tickets.length === 0 && highlightDates.length === 0) || selectedOption.value !== null)) {
            fetchData();
        }
    }, [highlightDates.length, selectedOption.value, setHighlightDates, setTickets, setRole, tickets.length, token.value]);

    const tileClassName = ({ date, view }) => {
        if (view !== "month") return null;

        const isSameMonth = date.getMonth() === activeStartDate.getMonth();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isToday = isSameDay(date, new Date());
        const isTicketDate = highlightDates.some(d => isSameDay(d, date));
        const isFuture = date > new Date();

        if (!isSameMonth) return null;
        if (isTicketDate) return "highlight";
        if (isToday) return "today-border";
        if (isWeekend) return "weekend";
        if (isFuture) return "future-date";

        return null;
    };

    const onDateClick = (date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        const hasTickets = highlightDates.some(d => isSameDay(d, date));
        const isSupervisor = role === "maintenance-supervisor" ? "true" : "false";

        if (hasTickets && tickets && tickets[formatted]) {
            const ticketDataForDay = tickets[formatted];
            navigate(`/tickets/${selectedOption.value}/${isSupervisor}/${formatted}`, {
                state: {
                    ticketData: ticketDataForDay
                }
            });
        }
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
                                dropdownData &&
                                    dropdownData.length > 1
                                    ?
                                    <div className="dropdown-wrapper">
                                        <Select
                                            className="react-select-container"
                                            styles={customStyles}
                                            classNamePrefix="react-select"
                                            isSearchable={false}
                                            options={dropdownData.map(item => ({
                                                ...item,
                                                label: item.name,
                                                value: item.id
                                            }))}
                                            value={selectedOption}
                                            onChange={(selected) => {
                                                setSelectedOption({ label: selected.name, value: selected.id });
                                            }}
                                        />
                                    </div>
                                    :
                                    <></>
                            }

                            <Calendar
                                tileClassName={tileClassName}
                                onClickDay={onDateClick}
                                onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                            />
                        </div>
                    )
            }
        </React.Fragment>
    );
}
