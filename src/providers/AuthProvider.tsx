import React, { ReactNode, useEffect } from 'react';
import { useUser } from '@/_store';
import { useNavigate } from 'react-router-dom';

const AuthContext = React.createContext(null);

const useAuthGuard = (middleware:string) => {
    const { token } = useUser() as any;
    const navigate = useNavigate();

    useEffect(() => {
        if(token === undefined) return;

        setTimeout(() => {
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