import { NavLink, Outlet } from 'react-router-dom';
export function App() { return <><header><NavLink to="/">Lifely AI</NavLink><nav><NavLink to="/care-plans">Care plans</NavLink><NavLink to="/check-ins">Check-in</NavLink><NavLink to="/goals">Goals</NavLink><NavLink to="/assistant">Assistant</NavLink></nav></header><Outlet /></>; }
