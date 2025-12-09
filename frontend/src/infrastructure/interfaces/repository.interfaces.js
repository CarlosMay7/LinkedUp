export class IRepository {
    async create(_data) {
        throw new Error('Method not implemented');
    }

    async findById(_id) {
        throw new Error('Method not implemented');
    }

    async findAll() {
        throw new Error('Method not implemented');
    }

    async update(_id, _data) {
        throw new Error('Method not implemented');
    }

    async delete(_id) {
        throw new Error('Method not implemented');
    }
}

export class IAuthRepository {
    async signIn({ email: _email, password: _password }) {
        throw new Error('Method not implemented');
    }

    async signUp({ email: _email, password: _password, options: _options }) {
        throw new Error('Method not implemented');
    }

    async signOut() {
        throw new Error('Method not implemented');
    }

    async updateUser(_updates) {
        throw new Error('Method not implemented');
    }

    async getSession() {
        throw new Error('Method not implemented');
    }

    onAuthStateChange(_callback) {
        throw new Error('Method not implemented');
    }

    async getUser() {
        throw new Error('Method not implemented');
    }
}

export class IMessageRepository extends IRepository {
    async getMessagesByRoom(_roomId) {
        throw new Error('Method not implemented');
    }

    async getMessagesBySender(_senderId) {
        throw new Error('Method not implemented');
    }

    async searchMessages(_roomId, _query) {
        throw new Error('Method not implemented');
    }
}

export class IRoomRepository extends IRepository {
    async addMember(_roomId, _userId) {
        throw new Error('Method not implemented');
    }

    async removeMember(_roomId, _userId) {
        throw new Error('Method not implemented');
    }

    async getRoomWithMembers(_roomId) {
        throw new Error('Method not implemented');
    }
}

export class IUserRepository extends IRepository {
    async getUserByEmail(_email) {
        throw new Error('Method not implemented');
    }

    async searchByUsername(_username) {
        throw new Error('Method not implemented');
    }

    async blockUser(_userId) {
        throw new Error('Method not implemented');
    }

    async unblockUser(_userId) {
        throw new Error('Method not implemented');
    }

    async warnUser(_userId) {
        throw new Error('Method not implemented');
    }
}

export class IProfanityStatsRepository extends IRepository {
    async getByUserId(_userId) {
        throw new Error('Method not implemented');
    }

    async updateByUserId(_userId, _data) {
        throw new Error('Method not implemented');
    }
}

export class IWebsocketRepository {
    emit(_event, _data) {
        throw new Error('Method not implemented');
    }

    on(_event, _callback) {
        throw new Error('Method not implemented');
    }

    off(_event, _callback) {
        throw new Error('Method not implemented');
    }

    connect() {
        throw new Error('Method not implemented');
    }

    disconnect() {
        throw new Error('Method not implemented');
    }
}
