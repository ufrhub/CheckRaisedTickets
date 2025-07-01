import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ApiProvider  } from './ApiContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ApiProvider >
      <BrowserRouter >
        <App />
      </BrowserRouter >
    </ApiProvider >
  </React.StrictMode>
);
