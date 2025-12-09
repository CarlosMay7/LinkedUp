export class IUseCase {
    async execute(_input) {
        throw new Error('Method not implemented');
    }
}

export class ISignInUseCase extends IUseCase {
    async execute({ email: _email, password: _password }) {
        throw new Error('Method not implemented');
    }
}

export class ISignUpUseCase extends IUseCase {
    async execute({ email: _email, password: _password, options: _options }) {
        throw new Error('Method not implemented');
    }
}

export class ISignOutUseCase extends IUseCase {
    async execute() {
        throw new Error('Method not implemented');
    }
}

export class IGetMessagesByRoomUseCase extends IUseCase {
    async execute({ roomId: _roomId }) {
        throw new Error('Method not implemented');
    }
}

export class ISearchMessagesUseCase extends IUseCase {
    async execute({ roomId: _roomId, query: _query }) {
        throw new Error('Method not implemented');
    }
}

export class ISendMessageUseCase extends IUseCase {
    async execute({ senderId: _senderId, roomId: _roomId, content: _content }) {
        throw new Error('Method not implemented');
    }
}

export class ICreateRoomUseCase extends IUseCase {
    async execute({ name: _name, createdBy: _createdBy, members: _members }) {
        throw new Error('Method not implemented');
    }
}

export class IListRoomsUseCase extends IUseCase {
    async execute() {
        throw new Error('Method not implemented');
    }
}

export class IDeleteRoomUseCase extends IUseCase {
    async execute({ roomId: _roomId }) {
        throw new Error('Method not implemented');
    }
}

export class IGetAllUsersUseCase extends IUseCase {
    async execute() {
        throw new Error('Method not implemented');
    }
}

export class IBlockUserUseCase extends IUseCase {
    async execute({ userId: _userId }) {
        throw new Error('Method not implemented');
    }
}

export class IGetProfanityStatsUseCase extends IUseCase {
    async execute({ userId: _userId }) {
        throw new Error('Method not implemented');
    }
}
