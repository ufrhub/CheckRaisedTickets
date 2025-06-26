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

    useEffect(() => {
        const ticketDates = tickets.map(ticket => new Date(ticket.date));
        setHighlightDates(ticketDates);
    }, []);

    const tileClassName = ({ date, view }) => {
        if (view !== "month") return null;

        const isToday = isSameDay(date, new Date());
        const isTicketDate = highlightDates.some(d => isSameDay(d, date));

        if (isTicketDate) return 'highlight';
        if (isToday) return 'today-border';

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
        </div>
    );
}