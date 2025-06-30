import { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Home.css';
import Select from 'react-select';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import tickets from '../tickets.json';
import { format, isSameDay } from 'date-fns';

export default function Home() {
    const navigate = useNavigate();
    const [highlightDates, setHighlightDates] = useState([]);
    const [token, setToken] = useState({ source: null, value: null });
    const [dropdownData, setDropdownData] = useState(null);
    const [selectedOption, setSelectedOption] = useState({ label: null, value: null });

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
        const handleMessage = (event) => {
            const message = event.data;

            try {
                if (message && typeof message === "object" && "data" in message) {
                    const data = JSON.parse(message.data);
                    const receivedToken = data.apiToken;
                    const result = data.result;

                    setToken({ source: "postMessage", value: receivedToken });
                    setDropdownData(result);
                    setSelectedOption({
                        label: result[0].name,
                        value: result[0].id
                    });
                }
            } catch (error) {
                console.warn("Ignoring non-JSON postMessage:", message);
            }
        };
        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
            delete window.setToken;
        };
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            // const url_with_token_required = `https://app.propkey.app/public/api/auth/maintenance-request-supervisor-calendar-val/${selectedOption.value}`;
            const url = `https://app.propkey.app/api/auth/maintenance-request-supervisor-calendar/${selectedOption.value}`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token.value}`
                    }
                });

                const result = response.data.result;
                const dateStrings = Object.keys(result);
                const dateObjects = dateStrings.map(date => new Date(date));

                setHighlightDates(dateObjects);
            } catch (error) {
                console.error('Error fetching maintenance data:', error);
            }
        };

        if (token.value !== null) {
            fetchData();
        }
    }, [selectedOption.value, token.value]);

    // useEffect(() => {
    //     const ticketDates = tickets.map(ticket => new Date(ticket.date));
    //     setHighlightDates(ticketDates);
    // }, []);

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