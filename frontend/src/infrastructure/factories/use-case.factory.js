import { supabase } from '../../auth/supabase/supabaseClient';

import { RoomRepository } from '../repositories/room.repository';
import { MessageRepository } from '../repositories/message.repository';
import { ProfanityStatsRepository } from '../repositories/profanity-stats.repository';
import { UserRepository } from '../repositories/user.repository';
import { WebsocketRepository } from '../repositories/websocket.repository';
import { AuthRepository } from '../repositories/auth.repository';

import { SignInUseCase } from '../../core/use-cases/auth/sign-in.use-case';
import { SignUpUseCase } from '../../core/use-cases/auth/sign-up.use-case';
import { SignOutUseCase } from '../../core/use-cases/auth/sign-out.use-case';
import { UpdateUserUseCase } from '../../core/use-cases/auth/update-user.use-case';
import { GetSessionUseCase } from '../../core/use-cases/auth/get-session.use-case';

import { CreateRoomUseCase } from '../../core/use-cases/room/create-room.use-case';
import { ListRoomsUseCase } from '../../core/use-cases/room/list-rooms.use-case';
import { UpdateRoomUseCase } from '../../core/use-cases/room/update-room.use-case';
import { DeleteRoomUseCase } from '../../core/use-cases/room/delete-room.use-case';
import { AddMemberUseCase } from '../../core/use-cases/room/add-member.use-case';
import { GetRoomWithMembersUseCase } from '../../core/use-cases/room/get-room-with-members.use-case';

import { GetMessagesByRoomUseCase } from '../../core/use-cases/message/get-messages-by-room.use-case';
import { FilterMessagesBySenderUseCase } from '../../core/use-cases/message/filter-messages-by-sender.use-case';
import { SearchMessagesUseCase } from '../../core/use-cases/message/search-messages.use-case';
import { SendMessageUseCase } from '../../core/use-cases/chat/send-message.use-case';

import { GetProfanityStatsUseCase } from '../../core/use-cases/profanity-stats/get-profanity-stats.use-case';
import { GetAllProfanityStatsUseCase } from '../../core/use-cases/profanity-stats/get-all-profanity-stats.use-case';
import { UpdateProfanityStatsUseCase } from '../../core/use-cases/profanity-stats/update-profanity-stats.use-case';

import { JoinRoomUseCase } from '../../core/use-cases/chat/join-room.use-case';
import { LeaveRoomUseCase } from '../../core/use-cases/chat/leave-room.use-case';
import { RegisterUserUseCase } from '../../core/use-cases/chat/register-user.use-case';
import { InitializeWebsocketUseCase } from '../../core/use-cases/chat/initialize-websocket.use-case';
import { FinalizeWebsocketUseCase } from '../../core/use-cases/chat/finalize-websocket.use-case';

import { GetAllUsersUseCase } from '../../core/use-cases/user/get-all-users.use-case';
import { GetUserByIdUseCase } from '../../core/use-cases/user/get-user-by-id.use-case';
import { SearchUsersByUsernameUseCase } from '../../core/use-cases/user/search-users-by-username.use-case';
import { BlockUserUseCase } from '../../core/use-cases/user/block-user.use-case';
import { UnblockUserUseCase } from '../../core/use-cases/user/unblock-user.use-case';
import { WarnUserUseCase } from '../../core/use-cases/user/warn-user.use-case';

export class UseCaseFactory {
    constructor() {
        this.roomRepository = new RoomRepository(supabase);
        this.messageRepository = new MessageRepository(supabase);
        this.profanityStatsRepository = new ProfanityStatsRepository(supabase);
        this.userRepository = new UserRepository(supabase);
        this.websocketRepository = new WebsocketRepository();
        this.authRepository = new AuthRepository(supabase);
    }

    createSignInUseCase() {
        return new SignInUseCase(this.authRepository, this.userRepository);
    }

    createSignUpUseCase() {
        return new SignUpUseCase(this.authRepository);
    }

    createSignOutUseCase() {
        return new SignOutUseCase(this.authRepository);
    }

    createUpdateUserUseCase() {
        return new UpdateUserUseCase(this.authRepository);
    }

    createGetSessionUseCase() {
        return new GetSessionUseCase(this.authRepository);
    }

    createCreateRoomUseCase() {
        return new CreateRoomUseCase(this.roomRepository);
    }

    createListRoomsUseCase() {
        return new ListRoomsUseCase(this.roomRepository);
    }

    createUpdateRoomUseCase() {
        return new UpdateRoomUseCase(this.roomRepository);
    }

    createDeleteRoomUseCase() {
        return new DeleteRoomUseCase(this.roomRepository);
    }

    createAddMemberUseCase() {
        return new AddMemberUseCase(this.roomRepository);
    }

    createGetRoomWithMembersUseCase() {
        return new GetRoomWithMembersUseCase(
            this.roomRepository,
            this.userRepository
        );
    }

    createGetMessagesByRoomUseCase() {
        return new GetMessagesByRoomUseCase(this.messageRepository);
    }

    createFilterMessagesBySenderUseCase() {
        return new FilterMessagesBySenderUseCase(this.messageRepository);
    }

    createSearchMessagesUseCase() {
        return new SearchMessagesUseCase(this.messageRepository);
    }

    createSendMessageUseCase() {
        return new SendMessageUseCase(this.websocketRepository);
    }

    createGetProfanityStatsUseCase() {
        return new GetProfanityStatsUseCase(this.profanityStatsRepository);
    }

    createGetAllProfanityStatsUseCase() {
        return new GetAllProfanityStatsUseCase(this.profanityStatsRepository);
    }

    createUpdateProfanityStatsUseCase() {
        return new UpdateProfanityStatsUseCase(this.profanityStatsRepository);
    }

    createJoinRoomUseCase() {
        return new JoinRoomUseCase(this.websocketRepository);
    }

    createLeaveRoomUseCase() {
        return new LeaveRoomUseCase(this.websocketRepository);
    }

    createRegisterUserUseCase() {
        return new RegisterUserUseCase(this.websocketRepository);
    }

    createInitializeWebsocketUseCase() {
        return new InitializeWebsocketUseCase(this.websocketRepository);
    }

    createFinalizeWebsocketUseCase() {
        return new FinalizeWebsocketUseCase(this.websocketRepository);
    }

    createGetAllUsersUseCase() {
        return new GetAllUsersUseCase(this.userRepository);
    }

    createGetUserByIdUseCase() {
        return new GetUserByIdUseCase(this.userRepository);
    }

    createSearchUsersByUsernameUseCase() {
        return new SearchUsersByUsernameUseCase(this.userRepository);
    }

    createBlockUserUseCase() {
        return new BlockUserUseCase(this.userRepository);
    }

    createUnblockUserUseCase() {
        return new UnblockUserUseCase(this.userRepository);
    }

    createWarnUserUseCase() {
        return new WarnUserUseCase(this.userRepository);
    }
}

export const useCaseFactory = new UseCaseFactory();
