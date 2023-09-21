import prisma from './primsaClient'
import { v4 } from 'uuid'
import { hashData, compareHash } from '@jabz/security-utils';
import { getEnvVar } from './utilities';

const userClient = prisma.user;


export interface NewUser {
    email: string
    password: string
}

/**
 * creates a single user
*/
export async function createSingleUser(newUserData: NewUser, idGenerator?: (newUserData?: NewUser) => string) {
    try {
        const validator = require("email-validator");
        if (!validator.validate(newUserData.password)) return false
        const result = await userClient.create({
            data: {
                id: idGenerator ? idGenerator(newUserData) : v4(),
                email: newUserData.email,
                password: await hashData(newUserData.password, 0),
                createdAt: Date.now(),
            }
        })
        return Boolean(result);
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
            password: await hashData(e.password, getEnvVar()),
            createdAt: Date.now(),
        }))
        const data = await Promise.all(newUser)
        const result = await userClient.createMany({ data })
        return Boolean(result)
    } catch (error) {
        console.error(error)
        return null
    }
}

/** confirm username password*/
export async function confirmUserNameAndPassword(userEmail: string, userRawPassword: string) {
    try {
        const result = await userClient.findFirst({ where: { email: userEmail } })
        if (result?.password) return await compareHash(userRawPassword, 0, result.password)
        else return false
    } catch (error) {
        console.log(error)
        return null
    }
}

export interface NewUserUpdate {
    newPassword: string | undefined
    newEmail: string | undefined

}

export async function tryUpdateUser(userEmail: string, userOldRawPassword: string, newData: NewUserUpdate) {

    try {
        const found = await confirmUserNameAndPassword(userEmail, userOldRawPassword)
        if (found) {
            const result = await userClient.update({
                where: { email: userEmail },
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
            where: { OR: [{ id: { in: userID } }, { email: { in: userID } }] },
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
        const result = await userClient.deleteMany({ where: { id: { in: userID } } })
        return Boolean(result.count)
    } catch (error) {
        return null;
    }
}
