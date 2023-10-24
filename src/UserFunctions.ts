import prisma from './primsaClient'
import { v4 } from 'uuid'
import { hashData, compareHash } from '@jabz/security-utils';
import { objectsEqual, getEnvVar } from './utilities';
import { UserCreationResults, UserCreationErrors, NewUser, NewUserUpdate, TwoFactorClientData } from '@jabz/shared-auth';
import { createNewAuthDevice } from './2Factor';

const userClient = prisma.user;



/**
 * creates a single user
*/
export async function createSingleUser(newUserData: NewUser, idGenerator?: (newUserData?: NewUser) => string): Promise<UserCreationResults> {
    try {
        const check = Object.values(newUserData.authDevice).map((e) => Boolean(e)).every((r) => r)
        if (!check) return { isValid: false, errorMessage: [UserCreationErrors.deviceDataMissing] }
        const exist = await userClient.findMany({ where: { OR: [{ userName: newUserData.userName }, { email: newUserData.email }] } })
        if (exist.length > 0) return { isValid: false, errorMessage: [UserCreationErrors.userExist] }
        const result = await userClient.create({
            data: {
                id: idGenerator ? idGenerator(newUserData) : v4(),
                email: newUserData.email,
                userName: newUserData.userName,
                password: await hashData(newUserData.password, 0),
                createdAt: Date.now(),
                lastPasswordUpdate: BigInt(Date.now()),
                authDevice: [JSON.stringify(createNewAuthDevice(newUserData.authDevice, true))],
            }
        })
        return { isValid: Boolean(result) };
    } catch (error) {
        console.error(error);
        return { isValid: false, errorMessage: ["There seems to be a server error"] }
    }

}

export async function verifyPassword(userID: string, authDevice: TwoFactorClientData, password: string) {
    try {
        const user = await userClient.findFirst({
            where: { OR: [{ id: userID }, { email: userID }, { userName: userID }] },
            select: {
                id: false,
                email: false,
                password: true,
                lastPasswordUpdate: false,
                createdAt: false,
                authDevice: true,
            }
        });

        if (objectsEqual(authDevice, JSON.parse(user?.authDevice as string ?? '{}'))) return undefined;
        else if (user) return compareHash(password, 0, user?.password);
        else return null;

    } catch (error) {
        console.error(error)
        return null
    }
}

/** create multiple new users*/
export async function createUsers(newUserData: NewUser[], idGenerator?: (newUserData?: NewUser) => string) {
    try {
        const validator = require("email-validator");
        const validUsers = newUserData.filter((e) => validator.validate(e.email))
        const newUser = validUsers.map(async (e) => ({
            id: idGenerator ? idGenerator(e) : v4(),
            email: e.email,
            userName: e.userName,
            password: await hashData(e.password, getEnvVar()),
            createdAt: Date.now(),
            authDevice: JSON.stringify(e.authDevice),
            lastPasswordUpdate: BigInt(Date.now()),
        }))
        const data = await Promise.all(newUser)
        const result = await userClient.createMany({ data });
        return Boolean(result)
    } catch (error) {
        console.error(error)
        return null
    }
}




export async function tryUpdateUser(userID: string, authDevice: TwoFactorClientData, userOldRawPassword: string, newData: NewUserUpdate) {

    try {
        const found = await verifyPassword(userID, authDevice, userOldRawPassword)
        if (found) {
            const result = await userClient.updateMany({
                where: { OR: [{ id: userID }, { email: userID }, { userName: userID }] },
                data: {
                    email: newData.newEmail,
                    password: newData.newPassword,
                    lastPasswordUpdate: newData.newPassword ? Date.now() : undefined,
                }
            })
            return Boolean(result);
        }
        else return false

    } catch (error) {
        return null;
    }
}

/** find users by ID*/
export async function findUser(userID: string[]) {
    try {
        return await userClient.findMany({
            where: { OR: [{ id: { in: userID } }, { email: { in: userID } }, { userName: { in: userID } }] },
            select: { id: true, email: true, createdAt: true }
        })
    } catch (error) {
        console.log(error)
        return []

    }
}

/** delete users by ID*/
export async function deleteUsersByID(userID: string[]) {
    try {
        const result = await userClient.deleteMany({ where: { OR: [{ id: { in: userID } }, { email: { in: userID } }, { userName: { in: userID } }] } })
        return Boolean(result.count)
    } catch (error) {
        return null;
    }
}
