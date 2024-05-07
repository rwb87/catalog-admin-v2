import React, { ReactNode, useEffect, useLayoutEffect } from 'react';
import { useUser } from '@/_store';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROLES } from '@/_config';
import fetch from '@/helpers/fetch';

const AuthContext = React.createContext(null);

const useAuthGuard = (middleware: 'auth' | 'guest') => {
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
    const { user, token, clearToken }: any = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if(!token) return;

        fetch({
            endpoint: `/users/me`,
            method: 'GET',
        }).catch(() => {
            clearToken();
            navigate('/login');
        });
    }, [token, navigate]);

    return(
        <AuthContext.Provider value={user}>
            {children}
        </AuthContext.Provider>
    );
}

export { useAuthGuard, AuthProvider };