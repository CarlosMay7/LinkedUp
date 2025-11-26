import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { SignInUseCase } from '../../core/use-cases/auth/sign-in.use-case';
import { SignUpUseCase } from '../../core/use-cases/auth/sign-up.use-case';
import { SignOutUseCase } from '../../core/use-cases/auth/sign-out.use-case';
import { UpdateUserUseCase } from '../../core/use-cases/auth/update-user.use-case';
import { GetSessionUseCase } from '../../core/use-cases/auth/get-session.use-case';
import { mapSupabaseError } from '../../infrastructure/errors/error-mapper';
import { User } from '../../core/entities/User';

const AuthContext = createContext();

const authRepository = new AuthRepository(supabase);
const signInUseCase = new SignInUseCase(authRepository);
const signUpUseCase = new SignUpUseCase(authRepository);
const signOutUseCase = new SignOutUseCase(authRepository);
const updateUserUseCase = new UpdateUserUseCase(authRepository);
const getSessionUseCase = new GetSessionUseCase(authRepository);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const syncSession = async () => {
            try {
                const { session } = await getSessionUseCase.execute();
                if (!isMounted) {
                    return;
                }
                setUser(session?.user ? User.fromSupabase(session.user) : null);
            } catch (error) {
                console.error('Error syncing session:', error);
            }
        };
        syncSession();

        const {
            data: { subscription },
        } = authRepository.onAuthStateChange((event, session) => {
            setUser(session?.user ? User.fromSupabase(session.user) : null);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signIn = async ({ email, password }) => {
        try {
            const data = await signInUseCase.execute({ email, password });
            return { data, error: null };
        } catch (error) {
            return {
                data: null,
                error: mapSupabaseError(error),
            };
        }
    };

    const signUp = async ({ email, password, data, emailRedirectTo }) => {
        try {
            const responseData = await signUpUseCase.execute({
                email,
                password,
                data,
                emailRedirectTo,
            });
            return { data: responseData, error: null };
        } catch (error) {
            return {
                data: null,
                error: mapSupabaseError(error),
            };
        }
    };

    const signOut = async () => {
        try {
            await signOutUseCase.execute();
            return { error: null };
        } catch (error) {
            return {
                error: mapSupabaseError(error),
            };
        }
    };

    const updateUser = async updates => {
        try {
            const data = await updateUserUseCase.execute(updates);

            const { session } = await getSessionUseCase.execute();
            if (session?.user) {
                setUser(User.fromSupabase(session.user));
            }

            return { data, error: null };
        } catch (error) {
            return {
                data: null,
                error: mapSupabaseError(error),
            };
        }
    };

    const metaData = {
        username: user?.username,
        role: user?.role,
        avatar: user?.avatar,
    };

    return (
        <AuthContext.Provider
            value={{ user, metaData, signIn, signUp, signOut, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
