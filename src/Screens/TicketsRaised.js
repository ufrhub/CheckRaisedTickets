import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useApiContext } from "../ApiContext";
import Select from "react-select";
import GroupedTicketList from "../Components/GroupedTicketList";
import "../Styles/TicketsRaised.css";
import axios from "axios";
import { isSameDay } from 'date-fns';
import Loader from '../Components/Loader';

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
  const { token, selectedTicket, setSelectedTicket, tickets, ticketDataForDay, setTicketDataForDay, technicians, setTechnicians } = useApiContext();
  const [selectedTitle, setSelectedTitle] = useState({ value: "All", label: "All" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const url = `https://app.propkey.app/public/api/auth/get-property-technician/${id}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        });

        const result = response.data.result;
        setTechnicians(result.data);
      } catch (error) {
        console.error('Error fetching technicians data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id && token.value) {
      fetchData();
    }
  }, [id, setTechnicians, token.value]);

  useEffect(() => {
    const ticketDataState =
      location.state?.ticketsForDate ||
      tickets?.[date] || ticketDataForDay || {};

    setTicketDataForDay(ticketDataState);

    const fetchData = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    if (!ticketDataState || Object.keys(ticketDataState).length === 0) {
      fetchData();
    }
  }, [date, id, location.state?.ticketsForDate, setTicketDataForDay, ticketDataForDay, tickets]);

  // const titleFilteredTickets =
  //   selectedTitle.value === "All"
  //     ? filteredTickets
  //     : filteredTickets.filter((ticket) => ticket.title === selectedTitle.value);

  const filteredTicketDataForDay = ticketDataForDay;

  return (
    <React.Fragment>
      {
        loading ? (
          <Loader />
        ) : (
          <div className="tickets-container">
            <div className="dropdown-wrapper">
              <Select
                className="react-select-container"
                styles={customStyles}
                classNamePrefix="react-select"
                isSearchable={false}
                options={technicians.map(item => ({
                  ...item,
                  label: item.name,
                  value: item.id
                }))}
                value={selectedTitle}
                onChange={(selected) => {
                  setSelectedTitle({ label: selected.name, value: selected.id });
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
        )
      }
    </React.Fragment>
  );
};

export default TicketsRaised;