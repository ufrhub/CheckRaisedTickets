import { useEffect, useState } from 'react';
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

    useEffect(() => {
        const ticketDates = tickets.map(ticket => new Date(ticket.date));
        setHighlightDates(ticketDates);

        // Expose window.setToken
        window.setToken = (receivedToken) => {
            console.log("Received token from native:", receivedToken);
            setToken(receivedToken); // update token state
        };

        // Optional: cleanup
        return () => {
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