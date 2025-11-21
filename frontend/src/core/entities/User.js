import { USER_ROLES } from '../../config/constants';

export class User {
    constructor({ id, uuid, email, username, role, avatar }) {
        this.id = id;
        this.uuid = uuid;
        this.email = email;
        this.username = username;
        this.role = role;
        this.avatar = avatar;
    }

    static fromSupabase(supabaseUser) {
        return new User({
            id: supabaseUser.id,
            uuid: supabaseUser.user_uuid,
            email: supabaseUser.email,
            username: supabaseUser.user_metadata?.username,
            role: supabaseUser.user_metadata?.role,
            avatar: supabaseUser.user_metadata?.avatar,
        });
    }

    isAdmin() {
        return this.role === USER_ROLES.ADMIN;
    }

    isProfessor() {
        return this.role === USER_ROLES.PROFESSOR;
    }

    isStudent() {
        return this.role === USER_ROLES.STUDENT;
    }
}
