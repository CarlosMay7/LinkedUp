import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const syncSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!isMounted) {
                return;
            }
            setUser(session?.user || null);
        };
        syncSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            if (event === 'SIGNED_OUT') {
                navigate('/auth/login', { replace: true });
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [navigate]);

    const signIn = async ({ email, password }) => {
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signUp = async ({ email, password, data, emailRedirectTo }) => {
        return supabase.auth.signUp({
            email,
            password,
            options: { data, emailRedirectTo },
        });
    };

    const signOut = async () => {
        return supabase.auth.signOut();
    };

    const metaData = user?.user_metadata ?? {};

    return (
        <AuthContext.Provider
            value={{ user, metaData, signIn, signUp, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
