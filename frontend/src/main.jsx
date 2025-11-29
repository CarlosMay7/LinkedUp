import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/context/AuthContext';
import { WebSocketProvider } from './chat/context/WebSocketContext.jsx';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <WebSocketProvider>
                    <App />
                </WebSocketProvider>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);
