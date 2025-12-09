import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '../../supabase/supabaseClient';
import { SignInUseCase } from '../../../core/use-cases/auth/sign-in.use-case';
import { SignUpUseCase } from '../../../core/use-cases/auth/sign-up.use-case';
import { SignOutUseCase } from '../../../core/use-cases/auth/sign-out.use-case';
import { UpdateUserUseCase } from '../../../core/use-cases/auth/update-user.use-case';
import { GetSessionUseCase } from '../../../core/use-cases/auth/get-session.use-case';

jest.mock('../../supabase/supabaseClient');
jest.mock('../../../core/use-cases/auth/sign-in.use-case');
jest.mock('../../../core/use-cases/auth/sign-up.use-case');
jest.mock('../../../core/use-cases/auth/sign-out.use-case');
jest.mock('../../../core/use-cases/auth/update-user.use-case');
jest.mock('../../../core/use-cases/auth/get-session.use-case');

const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
    avatar: 'avatar-url',
};

const TestComponent = () => {
    const auth = useAuth();
    return (
        <div>
            <div>{auth.user ? `User: ${auth.user.email}` : 'No user'}</div>
            <button
                onClick={() =>
                    auth.signIn({ email: 'test@example.com', password: 'pass' })
                }
            >
                Sign In
            </button>
            <button onClick={() => auth.signOut()}>Sign Out</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        supabase.auth = {
            getSession: jest.fn(),
            onAuthStateChange: jest.fn(),
        };

        GetSessionUseCase.mockImplementation(() => ({
            execute: jest.fn().mockResolvedValue({ session: null }),
        }));

        supabase.auth.onAuthStateChange.mockReturnValue({
            data: {
                subscription: {
                    unsubscribe: jest.fn(),
                },
            },
        });
    });

    describe('AuthProvider', () => {
        it('should render children', () => {
            render(
                <AuthProvider>
                    <div>Test Child</div>
                </AuthProvider>
            );

            expect(screen.getByText('Test Child')).toBeInTheDocument();
        });

        it('should initialize with no user', async () => {
            GetSessionUseCase.mockImplementation(() => ({
                execute: jest.fn().mockResolvedValue({ session: null }),
            }));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByText('No user')).toBeInTheDocument();
            });
        });

        it('should load user from session', async () => {
            const mockSession = {
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    user_metadata: {
                        username: 'testuser',
                        role: 'user',
                        avatar: 'avatar-url',
                    },
                },
            };

            GetSessionUseCase.mockImplementation(() => ({
                execute: jest.fn().mockResolvedValue({ session: mockSession }),
            }));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(
                    screen.getByText('User: test@example.com')
                ).toBeInTheDocument();
            });
        });
    });

    describe('useAuth hook', () => {
        it('should provide signIn function', async () => {
            const mockSignIn = jest.fn().mockResolvedValue({
                data: { session: { user: mockUser } },
            });

            SignInUseCase.mockImplementation(() => ({
                execute: mockSignIn,
            }));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const signInButton = screen.getByText('Sign In');
            signInButton.click();

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalled();
            });
        });

        it('should provide signOut function', async () => {
            const mockSignOut = jest.fn().mockResolvedValue({});

            SignOutUseCase.mockImplementation(() => ({
                execute: mockSignOut,
            }));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            const signOutButton = screen.getByText('Sign Out');
            signOutButton.click();

            await waitFor(() => {
                expect(mockSignOut).toHaveBeenCalled();
            });
        });

        it('should throw error when used outside provider', () => {
            // Suppress console.error for this test
            const spy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                render(<TestComponent />);
            }).toThrow();

            spy.mockRestore();
        });

        it('should provide metaData', async () => {
            const mockSession = {
                user: {
                    id: 'user-123',
                    email: 'test@example.com',
                    user_metadata: {
                        username: 'testuser',
                        role: 'admin',
                        avatar: 'avatar-url',
                    },
                },
            };

            GetSessionUseCase.mockImplementation(() => ({
                execute: jest.fn().mockResolvedValue({ session: mockSession }),
            }));

            const MetaDataComponent = () => {
                const { metaData } = useAuth();
                return (
                    <div>
                        <div>{metaData.username}</div>
                        <div>{metaData.role}</div>
                        <div>{metaData.avatar}</div>
                    </div>
                );
            };

            render(
                <AuthProvider>
                    <MetaDataComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByText('testuser')).toBeInTheDocument();
                expect(screen.getByText('admin')).toBeInTheDocument();
            });
        });
    });

    describe('signIn', () => {
        it('should return data and no error on successful sign in', async () => {
            const mockSignInData = { session: { user: mockUser } };
            const mockSignIn = jest.fn().mockResolvedValue(mockSignInData);

            SignInUseCase.mockImplementation(() => ({
                execute: mockSignIn,
            }));

            const SignInTestComponent = () => {
                const { signIn } = useAuth();
                const [result, setResult] = React.useState(null);

                const handleSignIn = async () => {
                    const res = await signIn({
                        email: 'test@example.com',
                        password: 'pass',
                    });
                    setResult(res);
                };

                return (
                    <div>
                        <button onClick={handleSignIn}>Sign In</button>
                        {result && (
                            <div>{result.error ? 'Error' : 'Success'}</div>
                        )}
                    </div>
                );
            };

            render(
                <AuthProvider>
                    <SignInTestComponent />
                </AuthProvider>
            );

            const button = screen.getByText('Sign In');
            button.click();

            await waitFor(() => {
                expect(screen.getByText('Success')).toBeInTheDocument();
            });
        });
    });

    describe('signUp', () => {
        it('should handle sign up', async () => {
            const mockSignUp = jest.fn().mockResolvedValue({ user: mockUser });

            SignUpUseCase.mockImplementation(() => ({
                execute: mockSignUp,
            }));

            const SignUpTestComponent = () => {
                const { signUp } = useAuth();
                const [called, setCalled] = React.useState(false);

                const handleSignUp = async () => {
                    await signUp({
                        email: 'new@example.com',
                        password: 'pass',
                        data: {},
                    });
                    setCalled(true);
                };

                return (
                    <div>
                        <button onClick={handleSignUp}>Sign Up</button>
                        {called && <div>Sign up called</div>}
                    </div>
                );
            };

            render(
                <AuthProvider>
                    <SignUpTestComponent />
                </AuthProvider>
            );

            const button = screen.getByText('Sign Up');
            button.click();

            await waitFor(() => {
                expect(screen.getByText('Sign up called')).toBeInTheDocument();
            });
        });
    });

    describe('updateUser', () => {
        it('should update user data', async () => {
            const mockUpdate = jest.fn().mockResolvedValue({ user: mockUser });
            const mockGetSession = jest.fn().mockResolvedValue({
                session: {
                    user: { id: 'user-123', email: 'test@example.com' },
                },
            });

            UpdateUserUseCase.mockImplementation(() => ({
                execute: mockUpdate,
            }));

            GetSessionUseCase.mockImplementation(() => ({
                execute: mockGetSession,
            }));

            const UpdateUserTestComponent = () => {
                const { updateUser } = useAuth();
                const [updated, setUpdated] = React.useState(false);

                const handleUpdate = async () => {
                    await updateUser({ data: { username: 'newname' } });
                    setUpdated(true);
                };

                return (
                    <div>
                        <button onClick={handleUpdate}>Update</button>
                        {updated && <div>Updated</div>}
                    </div>
                );
            };

            render(
                <AuthProvider>
                    <UpdateUserTestComponent />
                </AuthProvider>
            );

            const button = screen.getByText('Update');
            button.click();

            await waitFor(() => {
                expect(screen.getByText('Updated')).toBeInTheDocument();
            });
        });
    });
});
