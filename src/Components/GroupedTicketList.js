import { useState, useRef, useEffect } from "react";
import "../Styles/TicketsRaised.css";

const GroupedTicketList = ({ tickets, onSelect }) => {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [maxHeights, setMaxHeights] = useState({});
    const contentRefs = useRef({});

    useEffect(() => {
        const newHeights = {};
        Object.keys(tickets).forEach((slotKey) => {
            const contentEl = contentRefs.current[slotKey];
            if (contentEl) {
                newHeights[slotKey] = contentEl.scrollHeight;
            }
        });
        setMaxHeights(newHeights);
    }, [tickets]);

    const toggleGroup = (slotKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [slotKey]: !prev[slotKey],
        }));
    };

    return (
        <div className="ticket-list">
            {Object.entries(tickets).map(([slotKey, groupTickets]) => {
                const isExpanded = expandedGroups[slotKey];

                return (
                    <div key={slotKey} className="ticket-group">
                        <div className="ticket-item" onClick={() => toggleGroup(slotKey)}>
                            <div className="ticket-main" style={{ display: "flex", flex: 1, cursor: "pointer" }}>
                                <div className="ticket-time-slot">{slotKey}</div>
                                <div className="ticket-details">
                                    <div className="ticket-length">{groupTickets.length}</div>
                                </div>
                            </div>

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
                            {groupTickets.map((ticket) => (
                                <div
                                    key={ticket.maintenance_request_id}
                                    className="dropdown-ticket-item"
                                    onClick={() => onSelect(ticket)}
                                >
                                    <div className="dropdown-ticket-details">
                                        <div className="dropdown-ticket-unit">
                                            Unit {ticket.unit || "N/A"}
                                        </div>
                                        <div className="dropdown-ticket-name">
                                            ({ticket.name || "Anonymous"})
                                        </div>
                                    </div>
                                    <div className="dropdown-ticket-reason">
                                        <div className="dropdown-ticket-category">
                                            {ticket.sub_category || "Anonymous"}
                                        </div>
                                        <div className="dropdown-ticket-assignto">
                                            ({ticket.assignto || "N/A"})
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default GroupedTicketList;
