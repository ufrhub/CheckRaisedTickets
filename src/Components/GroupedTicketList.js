import { useState } from "react";
import "../Styles/TicketsRaised.css";

const parseTimeToSlotKey = (timeStr) => {
    const is12Hour = /am|pm/i.test(timeStr);
    let dateObj;

    if (is12Hour) {
        dateObj = new Date(`1970-01-01T${timeStr.toUpperCase()}`);
    } else {
        dateObj = new Date(`1970-01-01T${timeStr}`);
    }

    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const flooredMinutes = minutes < 30 ? 0 : 30;
    const groupHour = hours.toString().padStart(2, '0');
    const groupMin = flooredMinutes === 0 ? "00" : "30";

    return `${groupHour}:${groupMin}`;
};

const GroupedTicketList = ({ tickets, onSelect }) => {
    const [expandedGroups, setExpandedGroups] = useState({});

    const groupedTickets = {};
    tickets.forEach((ticket) => {
        const slotKey = parseTimeToSlotKey(ticket.time);
        if (!groupedTickets[slotKey]) groupedTickets[slotKey] = [];
        groupedTickets[slotKey].push(ticket);
    });

    const toggleGroup = (slotKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [slotKey]: !prev[slotKey],
        }));
    };

    return (
        <div className="ticket-list">
            {Object.entries(groupedTickets).map(([slotKey, groupTickets]) => {
                const isExpanded = expandedGroups[slotKey];
                const firstTicket = groupTickets[0];

                return (
                    <div key={slotKey} className="ticket-group">
                        <div className="ticket-item group-header">
                            {/* Main clickable area for modal */}
                            <div
                                className="ticket-main"
                                onClick={() => onSelect(firstTicket)}
                                style={{ display: "flex", flex: 1, cursor: "pointer" }}
                            >
                                <div className="ticket-time">{slotKey}</div>
                                <div className="ticket-details">
                                    <div className="ticket-unit">Unit {firstTicket.eNo.slice(-3)}</div>
                                    <div className="ticket-name">({firstTicket.name || "Anonymous"})</div>
                                </div>
                            </div>

                            {/* Dropdown icon */}
                            <div
                                className="dropdown-icon-box"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (groupTickets.length > 1) toggleGroup(slotKey);
                                }}
                                style={{ opacity: groupTickets.length > 1 ? 1 : 0.3 }}
                            >
                                <div
                                    className="dropdown-icon"
                                    style={{
                                        transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                >
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Expanded tickets */}
                        {isExpanded &&
                            groupTickets.slice(1).map((ticket, i) => (
                                <div
                                    key={i}
                                    className="ticket-item sub-ticket"
                                    onClick={() => onSelect(ticket)}
                                >
                                    <div className="ticket-time">{ticket.time}</div>
                                    <div className="ticket-details">
                                        <div className="ticket-unit">Unit {ticket.eNo.slice(-3)}</div>
                                        <div className="ticket-name">({ticket.name || "Anonymous"})</div>
                                    </div>
                                </div>
                            ))}
                    </div>

                );
            })}
        </div>
    );
};

export default GroupedTicketList;