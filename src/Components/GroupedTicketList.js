import { useState, useRef, useMemo, useEffect } from "react";
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
    const [maxHeights, setMaxHeights] = useState({});
    const contentRefs = useRef({});

    const groupedTickets = useMemo(() => {
        const result = {};
        tickets.forEach((ticket) => {
            const slotKey = parseTimeToSlotKey(ticket.time);
            if (!result[slotKey]) result[slotKey] = [];
            result[slotKey].push(ticket);
        });
        return result;
    }, [tickets]);

    // ✅ Now it's safe to add groupedTickets as a dependency
    useEffect(() => {
        const newHeights = {};
        Object.keys(groupedTickets).forEach((slotKey) => {
            const contentEl = contentRefs.current[slotKey];
            if (contentEl) {
                newHeights[slotKey] = contentEl.scrollHeight;
            }
        });
        setMaxHeights(newHeights);
    }, [groupedTickets]);

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

                return (
                    <div
                        key={slotKey}
                        className="ticket-group"
                    >
                        <div
                            className="ticket-item"
                            onClick={(e) => {
                                toggleGroup(slotKey);
                            }}
                        >
                            {/* Main clickable area for modal */}
                            <div
                                className="ticket-main"
                                style={{ display: "flex", flex: 1, cursor: "pointer" }}
                            >
                                <div className="ticket-time-slot">{slotKey}</div>
                                <div className="ticket-details">
                                    <div className="ticket-length">{groupTickets.length}</div>
                                </div>
                            </div>

                            {/* Dropdown icon */}
                            <div
                                className="dropdown-icon-box"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroup(slotKey);
                                }}
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
                        <div
                            className="dropdown-ticket-container"
                            ref={(el) => (contentRefs.current[slotKey] = el)}
                            style={{
                                maxHeight: isExpanded ? `${maxHeights[slotKey] || 0}px` : "0px",
                                opacity: isExpanded ? 1 : 0,
                                overflow: "hidden",
                                transition: "max-height 0.3s ease, opacity 0.3s ease",
                            }}
                        >
                            {
                                groupTickets.map((ticket, i) => (
                                    <div
                                        key={i}
                                        className="dropdown-ticket-item"
                                        onClick={() => onSelect(ticket)}
                                    >
                                        <div className="dropdown-ticket-details">
                                            <div className="dropdown-ticket-unit">Unit {ticket.eNo.slice(-3)}</div>
                                            <div className="dropdown-ticket-name">({ticket.name || "Anonymous"})</div>
                                        </div>
                                        <div className="dropdown-ticket-reason">{ticket.service}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GroupedTicketList;