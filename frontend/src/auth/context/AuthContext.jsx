import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
// Removed navigation from context to keep it side-effect free
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { mapSupabaseError } from '../../infrastructure/errors/error-mapper';
// Removed ROUTES from context

const AuthContext = createContext();

const authRepository = new AuthRepository(supabase);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const syncSession = async () => {
            const {
                data: { session },
            } = await authRepository.getSession();
            if (!isMounted) {
                return;
            }
            setUser(session?.user || null);
        };
        syncSession();

        const {
            data: { subscription },
        } = authRepository.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            // Removed navigation logic to keep it side-effect free
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async ({ email, password }) => {
        const { data, error } = await authRepository.signIn({
            email,
            password,
        });
        return {
            data,
            error: error ? mapSupabaseError(error) : null,
        };
    };

    const signUp = async ({ email, password, data, emailRedirectTo }) => {
        const { data: responseData, error } = await authRepository.signUp({
            email,
            password,
            options: { data, emailRedirectTo },
        });
        return {
            data: responseData,
            error: error ? mapSupabaseError(error) : null,
        };
    };

    const signOut = async () => {
        const { error } = await authRepository.signOut();
        return {
            error: error ? mapSupabaseError(error) : null,
        };
    };

    const updateUser = async updates => {
        const { data, error } = await authRepository.updateUser(updates);
        const mappedError = error ? mapSupabaseError(error) : null;

        if (!mappedError) {
            const {
                data: { user: freshUser },
            } = await authRepository.getUser();
            if (freshUser) {
                setUser(freshUser);
            }
        }

        return {
            data,
            error: mappedError,
        };
    };

    const metaData = user?.user_metadata ?? {};

    return (
        <AuthContext.Provider
            value={{ user, metaData, signIn, signUp, signOut, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
