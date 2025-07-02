import { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useApiContext } from "../ApiContext";
import Select from "react-select";
import ticketData from "../tickets.json";
import GroupedTicketList from "../Components/GroupedTicketList";
import "../Styles/TicketsRaised.css";
import axios from "axios";
import { isSameDay } from 'date-fns';

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
  const { id, date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedTicket, setSelectedTicket, tickets, ticketDataForDay, setTicketDataForDay, } = useApiContext();
  const [selectedTitle, setSelectedTitle] = useState({ value: "All", label: "All" });

  useEffect(() => {
    const ticketDataState =
      location.state?.ticketsForDate ||
      tickets?.[date] || ticketDataForDay || {};

    setTicketDataForDay(ticketDataState);

    const fetchData = async () => {
      // const url_with_token_required = `https://app.propkey.app/public/api/auth/maintenance-request-supervisor-calendar-val/${selectedOption.value}`;
      const url = `https://app.propkey.app/api/auth/maintenance-request-supervisor-calendar/${id}`;

      try {
        // const response = await axios.get(url, {
        //     headers: {
        //         Authorization: `Bearer ${token.value}`
        //     }
        // });
        const response = await axios.get(url);

        const result = response.data.result;
        const dateKeys = Object.keys(result);
        const dateObjects = dateKeys.map(date => new Date(date));
        const hasTickets = dateObjects.some(d => isSameDay(d, date));

        if (hasTickets) {
          const mTicketData = result[date];
          setTicketDataForDay(mTicketData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (!ticketDataState || Object.keys(ticketDataState).length === 0) {
      fetchData();
    }
  }, [date, id, location.state?.ticketsForDate, setTicketDataForDay, ticketDataForDay, tickets]);

  const filteredTickets = ticketData.filter((ticket) => ticket.date === date);

  const allTitles = [
    { value: "All", label: "All" },
    ...Array.from(new Set(filteredTickets.map((t) => t.title)))
      .sort()
      .map((title) => ({ value: title, label: title }))
  ];

  // const titleFilteredTickets =
  //   selectedTitle.value === "All"
  //     ? filteredTickets
  //     : filteredTickets.filter((ticket) => ticket.title === selectedTitle.value);

  const filteredTicketDataForDay = ticketDataForDay;

  console.log("ticketDataForDay: ", ticketDataForDay);

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
          onClick={() => navigate(-1)}
        />
        <h2>{formatDisplayDate(date)}</h2>
      </div>

      {filteredTicketDataForDay.length === 0 ? (
        <p className="no-tickets">No tickets found for this date.</p>
      ) : (
        <GroupedTicketList
          tickets={filteredTicketDataForDay}
          onSelect={(ticket) => setSelectedTicket(ticket)}
        />
      )}

      {selectedTicket && (
        <div className="ticket-modal" onClick={() => setSelectedTicket(null)}>
          <div className="ticket-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedTicket.title}</h3>
            <p><strong>Technician:</strong> {selectedTicket.assignto}</p>
            <p><strong>Name:</strong> {selectedTicket.name}</p>
            <p><strong>Category:</strong> {selectedTicket.sub_category}</p>
            <p><strong>Eno:</strong> {selectedTicket.unit}</p>

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