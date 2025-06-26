import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import ticketData from "../tickets.json";
import "../Styles/TicketsRaised.css";

const TICKETS_PER_PAGE = 20;

const formatTime = (index) => {
  const hours = Math.floor(index / 2) + 7;
  const minutes = index % 2 === 0 ? "00" : "30";
  const timeString = `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${hours >= 12 ? "PM" : "AM"}`;
  return timeString;
};

const formatDisplayDate = (isoDateStr) => {
  const [year, month, day] = isoDateStr.split("-");
  const dateObj = new Date(`${year}-${month}-${day}`);
  return dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
};

const TicketsRaised = () => {
  const { date } = useParams();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTitle, setSelectedTitle] = useState({ value: "All", label: "All" });
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

  const filteredTickets = ticketData.filter((ticket) => ticket.date === date);

  const allTitles = [
    { value: "All", label: "All" },
    ...Array.from(new Set(filteredTickets.map((t) => t.title)))
      .sort()
      .map((title) => ({ value: title, label: title }))
  ];

  const titleFilteredTickets =
    selectedTitle.value === "All"
      ? filteredTickets
      : filteredTickets.filter((ticket) => ticket.title === selectedTitle.value);

  const totalPages = Math.ceil(titleFilteredTickets.length / TICKETS_PER_PAGE);
  const paginatedTickets = titleFilteredTickets.slice(
    (currentPage - 1) * TICKETS_PER_PAGE,
    currentPage * TICKETS_PER_PAGE
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="tickets-container">
      <div className="dropdown-wrapper">
        <Select
          className="react-select-container"
          styles={customStyles}
          classNamePrefix="react-select"
          isSearchable={false}
          options={allTitles}
          value={selectedTitle}
          onChange={(selected) => {
            setSelectedTitle(selected);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="tickets-header">
        <button className="back-icon-button" onClick={() => navigate("/")}>
          &#8592;
        </button>
        <h2>{formatDisplayDate(date)}</h2>
      </div>

      {filteredTickets.length === 0 ? (
        <p className="no-tickets">No tickets found for this date.</p>
      ) : (
        <>
          <div className="ticket-list">
            {paginatedTickets.map((ticket, index) => (
              <div
                key={ticket.eNo}
                className="ticket-item"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="ticket-time">
                  {formatTime(index + (currentPage - 1) * TICKETS_PER_PAGE)}
                </div>
                <div className="ticket-details">
                  <div className="ticket-unit">Unit {ticket.eNo.slice(-3)}</div>
                  <div className="ticket-name">({ticket.name || "Anonymous"})</div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button onClick={handlePrev} disabled={currentPage === 1}>
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {selectedTicket && (
        <div className="ticket-modal" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTicket.title}</h3>
            <p><strong>Issue:</strong> {selectedTicket.issue}</p>
            <p><strong>Street:</strong> {selectedTicket.street}</p>
            <p><strong>Contact No:</strong> {selectedTicket.contactNo}</p>
            <p><strong>Eno:</strong> {selectedTicket.eNo}</p>

            <div className="ticket-modal-footer">
              <button onClick={() => setSelectedTicket(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsRaised;