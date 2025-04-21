import { getAppId, getSocketURL } from '@/components/shared';
import { website_name } from '@/utils/site-config';
import DerivAPIBasic from '@deriv/deriv-api/dist/DerivAPIBasic';
import { getInitialLanguage } from '@deriv-com/translations';
import APIMiddleware from './api-middleware';

// Function to retrieve client_id from localStorage
const getClientId = () => {
    const login_id = localStorage.getItem('active_loginid');
    const accounts = JSON.parse(localStorage.getItem('accountsList')) ?? {};
    const active_account = accounts[login_id];
    return active_account?.client_id ?? null; // Return client_id from active account
};

export const generateDerivApiInstance = () => {
    // Get the server and app_id
    const cleanedServer = getSocketURL().replace(/[^a-zA-Z0-9.]/g, '');
    const cleanedAppId = getAppId()?.replace?.(/[^a-zA-Z0-9]/g, '') ?? getAppId();
    
    // Retrieve client_id
    const clientId = getClientId();
    
    // If client_id is missing, log an error and return
    if (!clientId) {
        console.error('Error: Missing client_id');
        return null; // or handle appropriately
    }

    // Construct the WebSocket URL including the client_id
    const socket_url = `wss://${cleanedServer}/websockets/v3?app_id=${cleanedAppId}&l=${getInitialLanguage()}&brand=${website_name.toLowerCase()}&client_id=${clientId}`;
    
    // Create the WebSocket connection
    const deriv_socket = new WebSocket(socket_url);

    // Create the API instance
    const deriv_api = new DerivAPIBasic({
        connection: deriv_socket,
        middleware: new APIMiddleware({}),
    });
    
    return deriv_api;
};

// Other functions (getLoginId, V2GetActiveToken, etc.) remain the same
