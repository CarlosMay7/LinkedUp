import { User } from '../../core/entities/User';

export class UserRepository {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }

    async getAllUsers() {
        const { data, error } = await this.dbClient.from('users').select('*');

        if (error) {
            throw error;
        }

        return data.map(user => this.mapToUserEntity(user));
    }

    async getUserById(userId) {
        const { data, error } = await this.dbClient
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            throw error;
        }

        return this.mapToUserEntity(data);
    }

    async searchUserByUsername(username) {
        const { data, error } = await this.dbClient
            .from('users')
            .select('*')
            .ilike('username', `%${username}%`);

        if (error) {
            throw error;
        }
        return data.map(user => this.mapToUserEntity(user));
    }

    async blockUser(userId) {
        const { error } = await this.dbClient
            .from('users')
            .update({ blocked: true })
            .eq('user_uuid', userId);

        if (error) {
            throw error;
        }
    }

    async unblockUser(userId) {
        const { error } = await this.dbClient
            .from('users')
            .update({ blocked: false })
            .eq('user_uuid', userId);

        if (error) {
            throw error;
        }
    }

    async warnUser(userId) {
        const { error } = await this.dbClient
            .from('users')
            .update({ warned: true })
            .eq('user_uuid', userId);

        if (error) {
            throw error;
        }
    }

    async unwarnUser(userId) {
        const { error } = await this.dbClient
            .from('users')
            .update({ warned: false })
            .eq('user_uuid', userId);

        if (error) {
            throw error;
        }
    }

    mapToUserEntity(dbUser) {
        return new User({
            id: dbUser.id,
            email: dbUser.email,
            uuid: dbUser.user_uuid,
            username: dbUser.username,
            role: dbUser.role,
            avatar: dbUser.avatar,
            blocked: dbUser.blocked,
            warned: dbUser.warned,
        });
    }
}
