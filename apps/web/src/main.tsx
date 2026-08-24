import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { DashboardPage } from './features/dashboard/DashboardPage';
import './styles/global.css';

const Placeholder = () => <main><h1>Coming next</h1><p>This feature is ready for its domain module.</p></main>;
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><Routes><Route element={<App />}><Route index element={<DashboardPage />} /><Route path="care-plans" element={<Placeholder />} /><Route path="check-ins" element={<Placeholder />} /><Route path="goals" element={<Placeholder />} /><Route path="assistant" element={<Placeholder />} /></Route></Routes></BrowserRouter></React.StrictMode>);
