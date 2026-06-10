import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import JointScreen from "./screens/JointScreen/JointScreen";
import Sidebar from "./components/sidebar/Sidebar";
import SettingsScreen from "./screens/SettingsScreen/SettingsScreen";
import User1Screen from "./screens/User1Screen/User1Screen";
import User2Screen from "./screens/User2Screen/User2Screen";
import TransactionScreen from "./screens/TransactionScreen/TransactionScreen";
import { StatementPeriodProvider } from './context/StatementPeriodProvider';
import PaymentScreen from "./features/payments/components/PaymentScreen";
import LoginScreen from './screens/LoginScreen/LoginScreen';
import { isAuthenticated, subscribeAuthSession } from './lib/authSession';

/**
 * App
 * Main application component. Provides routing and context providers.
 *
 * @returns {JSX.Element}
 */
const logger = {
    info: (...args) => console.log('[App]', ...args),
    error: (...args) => console.error('[App]', ...args),
};

function App() {
    logger.info('App initialized');

    const [authed, setAuthed] = useState(() => isAuthenticated());

    useEffect(() => {
        const unsub = subscribeAuthSession(() => {
            setAuthed(isAuthenticated());
        });
        return unsub;
    }, []);

    useEffect(() => {
        const timerId = setInterval(() => {
            setAuthed(isAuthenticated());
        }, 30000);
        return () => clearInterval(timerId);
    }, []);

    if (!authed) {
        return <LoginScreen onLoginSuccess={() => setAuthed(true)} />;
    }

    return (
        <Router>
            <Sidebar />
            <StatementPeriodProvider>
                <div className={"main-content"}>
                    <Routes>
                        <Route path="/" element={<TransactionScreen />} />
                        <Route path="/joint" element={<JointScreen />} />
                        <Route path="/user1" element={<User1Screen />} />
                        <Route path="/user2" element={<User2Screen />} />
                        <Route path="/settings" element={<SettingsScreen />} />
                        <Route path="/payments" element={<PaymentScreen />} />
                    </Routes>
                </div>
            </StatementPeriodProvider>
        </Router>
    );
}

export default App;