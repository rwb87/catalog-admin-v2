import React, { ReactNode, useLayoutEffect } from 'react';
import { useUser } from '@/_store';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES } from '@/_config';

const AuthContext = React.createContext(null);

const useAuthGuard = (middleware:string) => {
    const { token, role } = useUser() as any;
    const navigate = useNavigate();
    const location = useLocation();

    useLayoutEffect(() => {
        if(token === undefined) return;

        setTimeout(() => {
            if(token && role) {
                if(role === ROLES.DATA_MANAGER && !location.pathname?.includes('management')) return navigate('/looks/management');
            }
            if(middleware === 'guest' && token) return navigate('/looks');
            if(middleware === 'auth' && token === null) return navigate('/login');
        }, 10);
    }, [token]);
}

const AuthProvider = ({ children }: {children: ReactNode}) => {
    const { user }: any = useUser();

    return(
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}

export { useAuthGuard, AuthProvider };