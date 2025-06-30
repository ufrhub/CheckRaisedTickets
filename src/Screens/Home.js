import { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Home.css';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import tickets from '../tickets.json';
import { format, isSameDay } from 'date-fns';

export default function Home() {
    const navigate = useNavigate();
    const [highlightDates, setHighlightDates] = useState([]);
    const [token, setToken] = useState({ source: null, value: null });
    const [dropdownData, setDropdownData] = useState(null);
    const [selectedOption, setSelectedOption] = useState({ label: null, value: null });
    const [testToken, setTestToken] = useState(null);
    const setPropertiesReference = useRef(false);

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
        const setPropertiesOnce = ({ mToken, mSource, mDropdownData }) => {
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
                console.log(`Token set from ${mSource}:`, mToken);
            } else {
                console.log(`Ignored token from ${mSource} because token is already set`);
            }
        };

        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('token');
        setPropertiesOnce({ mToken: tokenFromUrl, mSource: "URL" });

        const handleMessage = (event) => {
            const message = event.data;

            try {
                const data = typeof message.data === "string" ? JSON.parse(message.data) : message.data;

                if (data && typeof data === "object" && "apiToken" in data && "result" in data) {
                    const token = data.apiToken;
                    const result = data.result;

                    setPropertiesOnce({
                        mToken: token,
                        mSource: "postMessage",
                        mDropdownData: result
                    });
                }

                if (message && typeof message === "object" && "data" in message) {
                    setTestToken(message.data, "postMessage");
                }
            } catch (error) {
                console.warn("⚠️ Ignoring non-JSON postMessage:", message);
            }
        };
        window.addEventListener("message", handleMessage);

        window.setToken = (receivedToken) => {
            setPropertiesOnce({ mToken: receivedToken, mSource: "window.setToken" });
        };

        return () => {
            window.removeEventListener("message", handleMessage);
            delete window.setToken;
        };
    }, []);

    useEffect(() => {
        const ticketDates = tickets.map(ticket => new Date(ticket.date));
        setHighlightDates(ticketDates);
    }, []);

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
        const hasTickets = highlightDates.some(d => isSameDay(d, date));
        if (hasTickets) {
            const formatted = format(date, 'yyyy-MM-dd');
            navigate(`/tickets/${formatted}`);
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
                testToken !== null
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
                        <p><strong>Token-2:</strong> {testToken}</p>
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
                        <p><strong>Token-2:</strong> "No token found...!"</p>
                    </div>
            }
        </div>
    );
}