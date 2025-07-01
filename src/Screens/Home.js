import { useEffect, useRef } from 'react';
import { useApiContext } from '../ApiContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Home.css';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay } from 'date-fns';

export default function Home() {
    const {
        token, setToken,
        dropdownData, setDropdownData,
        tickets, setTickets,
        highlightDates, setHighlightDates,
        selectedOption, setSelectedOption,
        setSelectedTicket,
    } = useApiContext();

    const setPropertiesReference = useRef(false);
    const navigate = useNavigate();

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

    useEffect(() => {
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
    }, [setDropdownData, setSelectedOption, setToken]);

    useEffect(() => {
        const fetchData = async () => {
            // const url_with_token_required = `https://app.propkey.app/public/api/auth/maintenance-request-supervisor-calendar-val/${selectedOption.value}`;
            const url = `https://app.propkey.app/api/auth/maintenance-request-supervisor-calendar/${selectedOption.value}`;

            try {
                // const response = await axios.get(url, {
                //     headers: {
                //         Authorization: `Bearer ${token.value}`
                //     }
                // });
                const response = await axios.get(url);

                const result = response.data.result;
                setTickets(result);
                console.log(result);
                const dateKeys = Object.keys(result);
                const dateObjects = dateKeys.map(date => new Date(date));

                setHighlightDates(dateObjects);
            } catch (error) {
                console.error('Error fetching maintenance data:', error);
            }
        };

        if (token.value !== null) {
            fetchData();
        }
    }, [selectedOption.value, setHighlightDates, setTickets, token.value]);

    const tileClassName = ({ date, view }) => {
        if (view !== "month") return null;

        const isToday = isSameDay(date, new Date());
        const isTicketDate = highlightDates.some(d => isSameDay(d, date));
        const isFuture = date > new Date();

        if (isTicketDate) return 'highlight';
        if (isToday) return 'today-border';
        if (isFuture) return 'future-date';

        return null;
    };

    const onDateClick = date => {
        const formatted = format(date, 'yyyy-MM-dd');
        const hasTickets = highlightDates.some(d => isSameDay(d, date));

        if (hasTickets && tickets && tickets[formatted]) {
            const ticketDataForDay = tickets[formatted];
            setSelectedTicket(ticketDataForDay);
            navigate(`/tickets/${formatted}`, {
                state: {
                    ticketData: ticketDataForDay
                }
            });
        }
    };

    return (
        <div className="container">
            {
                dropdownData &&
                    dropdownData.length > 0
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
                maxDate={new Date()}
            />

            {
                token.value !== null
                    ?
                    <div
                        className="token-display"
                        style={{
                            marginTop: "20px",
                            padding: "10px",
                            border: "1px dashed #ccc",
                            backgroundColor: "#f9f9f9",
                            fontSize: "24px",
                            color: "blue",
                        }}>
                        <p><strong>Token:</strong> {token.value}</p>
                    </div>
                    :
                    <div
                        className="token-display"
                        style={{
                            marginTop: "20px",
                            padding: "10px",
                            border: "1px dashed #ccc",
                            backgroundColor: "#f9f9f9",
                            fontSize: "24px",
                            color: "blue",
                        }}>
                        <p><strong>Token:</strong> "No token found...!"</p>
                    </div>
            }

            {
                highlightDates.length > 0
                    ?
                    <div
                        className="token-display"
                        style={{
                            marginTop: "20px",
                            padding: "10px",
                            border: "1px dashed #ccc",
                            backgroundColor: "#f9f9f9",
                            fontSize: "24px",
                            color: "blue",
                        }}>
                        <p><strong>Highlight Dates:</strong> {JSON.stringify(highlightDates)}</p>
                    </div>
                    :
                    <div
                        className="token-display"
                        style={{
                            marginTop: "20px",
                            padding: "10px",
                            border: "1px dashed #ccc",
                            backgroundColor: "#f9f9f9",
                            fontSize: "24px",
                            color: "blue",
                        }}>
                        <p><strong>Highlight Dates:</strong> "No highlight dates found...!"</p>
                    </div>
            }
        </div>
    );
}