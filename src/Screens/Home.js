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

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                });

                const result = response.data?.result || {};
                const role = response.data?.role;
                const dateKeys = Object.keys(result);

                setTickets(result);
                setRole(role)
                setHighlightDates(dateKeys);
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
        const dayKey = format(date, 'yyyy-MM-dd');
        const isTicketDate = (highlightDates || []).includes(dayKey);
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
        const hasTickets = (highlightDates || []).includes(formatted);
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

                            {/* raw JSON dump */}
                            <div style={{ padding: 12, marginTop: 12, background: '#f7f7f7', borderRadius: 8 }}>
                                <strong>highlightDates (raw):</strong>
                                <pre style={{ whiteSpace: 'pre-wrap' }}>
                                    {JSON.stringify(highlightDates ?? [], null, 2)}
                                </pre>
                            </div>
                        </div>
                    )
            }
        </React.Fragment>
    );
}
