import React, { useEffect, useMemo, useState } from "react";
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
  const { id, isSupervisor, date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { token, selectedTicket, setSelectedTicket, tickets, ticketDataForDay, setTicketDataForDay, technicians, setTechnicians } = useApiContext();
  const [selectedTechnician, setSelectedTechnician] = useState({ value: "All", label: "All" });
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
        setTechnicians([{ name: "All", id: "All" }, ...result.data]);
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
      const url = `https://app.propkey.app/public/api/auth/maintenance-request-supervisor-calendar-val/${id}`;

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        });

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
  }, [date, id, location.state?.ticketsForDate, setTicketDataForDay, ticketDataForDay, tickets, token.value]);

  const filteredTicketDataForDay = useMemo(() => {
    if (selectedTechnician.value === 'All') {
      return ticketDataForDay || {};
    }

    const filteredTickets = {};

    for (const time in ticketDataForDay) {
      const tickets = ticketDataForDay[time];
      const matches = tickets.filter(t => Number(t.assign_to_id) === Number(selectedTechnician.value));

      if (matches.length) {
        filteredTickets[time] = matches;
      }
      // OR
      // To preserve empty keys:
      // filteredTickets[time] = matches;
    }


    return filteredTickets;
  }, [ticketDataForDay, selectedTechnician.value]);

  const isMobile = () => /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

  const handlePhoneClick = (phoneNumber) => {
    if (isMobile()) {
      // On mobile: open dialer
      // window.location.href = `tel:${phoneNumber}`;
      window.location.href = `tel://${phoneNumber}`;
    } else {
      // On desktop: copy to clipboard
      navigator.clipboard.writeText(phoneNumber)
        .then(() => {
          alert(`Phone number ${phoneNumber} copied to clipboard`);
        })
        .catch(err => {
          console.error("Failed to copy!", err);
        });
    }
  };

  return (
    <React.Fragment>
      {
        loading ? (
          <Loader />
        ) : (
          <div className="tickets-container">
            {
              technicians &&
                isSupervisor === "true" &&
                technicians.length > 1
                ?
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
                    value={selectedTechnician}
                    onChange={(selected) => {
                      setSelectedTechnician({ label: selected.name, value: selected.id });
                    }}
                  />
                </div>
                :
                null
            }

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
                  <p><strong>Assigned To:</strong> {selectedTicket?.assignto}</p>
                  <p><strong>Status:</strong> {selectedTicket?.request_status}</p>
                  <p><strong>Date Requested:</strong> {formatDisplayDate(date)}</p>
                  <p><strong>Category:</strong> {selectedTicket?.type_of_request}</p>
                  <p><strong>Sub Category:</strong> {selectedTicket?.sub_category}</p>
                  <p><strong>Description:</strong> {selectedTicket?.description}</p>
                  <p><strong>Unit No:</strong> {selectedTicket?.unit}</p>
                  <p><strong>Resident Name:</strong> {selectedTicket?.name}</p>
                  <p>
                    <strong>Resident Phone No:</strong>{" "}
                    {/* <a href={`tel:${selectedTicket?.phone_number_1}`}>{selectedTicket?.phone_number_1}</a> */}
                    <button
                      type="button"
                      className="phone-link"
                      onClick={() => handlePhoneClick(selectedTicket.phone_number_1)}
                    >
                      {selectedTicket?.phone_number_1}
                    </button>
                  </p>

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