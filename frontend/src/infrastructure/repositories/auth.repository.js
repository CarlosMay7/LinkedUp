export class AuthRepository {
    constructor(supabaseClient) {
        this.client = supabaseClient;
    }

    async signIn({ email, password }) {
        return this.client.auth.signInWithPassword({ email, password });
    }

    async signUp({ email, password, options }) {
        return this.client.auth.signUp({
            email,
            password,
            options,
        });
    }

    async signOut() {
        return this.client.auth.signOut();
    }

    async updateUser(updates) {
        return this.client.auth.updateUser(updates);
    }

    async getSession() {
        return this.client.auth.getSession();
    }

    onAuthStateChange(callback) {
        return this.client.auth.onAuthStateChange(callback);
    }

    async getUser() {
        return this.client.auth.getUser();
    }
}
