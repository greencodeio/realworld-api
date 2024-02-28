import { UserType } from '@app/user/interfaces/user.type';

export interface IUserResponse {
    user: UserType & { token: string };
}
