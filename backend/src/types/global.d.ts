/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserRole } from './enums';

declare module 'express' {
    interface Request {
        user?: {
            userId: string;
            role: UserRole;
        };
        validated?: {
            body: any;
            params: any;
            query: any;
        };
    }
}

export { };
