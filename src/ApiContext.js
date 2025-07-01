import React, { createContext, useContext, useState } from 'react';

const ApiContext = createContext();

export const ApiProvider = ({ children }) => {
    const [token, setToken] = useState({ source: null, value: null });
    const [dropdownData, setDropdownData] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [highlightDates, setHighlightDates] = useState([]);
    const [selectedOption, setSelectedOption] = useState({ label: null, value: null });
    const [ticketDataForDay, setTicketDataForDay] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    return (
        <ApiContext.Provider
            value={{
                token, setToken,
                dropdownData, setDropdownData,
                tickets, setTickets,
                highlightDates, setHighlightDates,
                selectedOption, setSelectedOption,
                ticketDataForDay, setTicketDataForDay,
                selectedTicket, setSelectedTicket,
            }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApiContext = () => useContext(ApiContext);
