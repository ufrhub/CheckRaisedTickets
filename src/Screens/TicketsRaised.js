import { useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useApiContext } from "../ApiContext";
import Select from "react-select";
import ticketData from "../tickets.json";
import GroupedTicketList from "../Components/GroupedTicketList";
import "../Styles/TicketsRaised.css";

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
  // const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState({ value: "All", label: "All" });


  const { date } = useParams();
  const location = useLocation();

  const { selectedTicket, setSelectedTicket, tickets } = useApiContext();

  const ticketDataForDay =
    location.state?.ticketsForDate ||
    selectedTicket ||
    tickets?.[date] || {};

  console.log(ticketDataForDay)

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
          }}
        />
      </div>

      <div className="tickets-header">
        <img
          className="back-icon-button"
          src={require("../Assets/left-arrow.svg").default}
          alt="Go-Back"
          onClick={() => navigate("/")}
        />
        <h2>{formatDisplayDate(date)}</h2>
      </div>

      {filteredTickets.length === 0 ? (
        <p className="no-tickets">No tickets found for this date.</p>
      ) : (
        <GroupedTicketList
          tickets={titleFilteredTickets}
          onSelect={(ticket) => setSelectedTicket(ticket)}
        />
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