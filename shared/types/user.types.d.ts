export interface User {
    id: number;
    telegramId: bigint;
    username: string | null;
    firstName: string | null;
    createdAt: Date;
}
export interface CreateUserDto {
    telegramId: bigint;
    username?: string;
    firstName?: string;
}
