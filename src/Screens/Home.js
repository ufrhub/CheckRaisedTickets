import { useEffect, useState, useRef } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../Styles/Home.css';
import { useNavigate } from 'react-router-dom';
import tickets from '../tickets.json';
import { format, isSameDay } from 'date-fns';

export default function Home() {
    const navigate = useNavigate();
    const [highlightDates, setHighlightDates] = useState([]);
    const [token, setToken] = useState(null);
    const tokenSet = useRef(false);

    useEffect(() => {
        const ticketDates = tickets.map(ticket => new Date(ticket.date));
        setHighlightDates(ticketDates);
    }, []);

    useEffect(() => {
        const ticketDates = tickets.map(ticket => new Date(ticket.date));
        setHighlightDates(ticketDates);

        // Utility: only sets token if it hasn't been set yet
        const setTokenOnce = (newToken, source) => {
            if (!tokenSet.current && newToken) {
                tokenSet.current = true;
                setToken(newToken);
                console.log(`✅ Token set from ${source}:`, newToken);
            } else {
                console.log(`⛔ Ignored token from ${source} because token is already set`);
            }
        };

        // 1. Try to get token from URL
        const queryParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = queryParams.get('token');
        setTokenOnce(tokenFromUrl, "URL");

        // 2. Listen to messages from postMessage
        const handleMessage = (event) => {
            const message = event.data;
            if (message && typeof message === "object" && "data" in message) {
                setTokenOnce(message.data, "postMessage");
            }
        };
        window.addEventListener("message", handleMessage);

        // 3. Expose window.setToken for native WebView
        window.setToken = (receivedToken) => {
            setTokenOnce(receivedToken, "window.setToken");
        };

        // Cleanup
        return () => {
            window.removeEventListener("message", handleMessage);
            delete window.setToken;
        };
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
            <Calendar
                tileClassName={tileClassName}
                onClickDay={onDateClick}
                maxDate={new Date()}
            />

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
                <p><strong>Token:</strong> {token ? token : "No token found...!"}</p>
            </div>
        </div>
    );
}