import { TwoFactorQue } from "@prisma/client"
import prisma from "../primsaClient"
import { PasswordConfig, UsernameConfig, passWordCheck, validateEmail, usernameValidator, NewUser, TwoFactorClientData, NewUserUpdate } from "@jabz/shared-auth"
import { objectsEqual } from "../utilities"
import { generateTwoFactorQuery, findTwoFactorQuery, checkTwoFactorCode, removeTwoFactorQuery, addAuthDevice, trimTwoFactorRequest } from "../2Factor"
import { createSingleUser, verifyPassword, deleteUsersByID, tryUpdateUser } from "../UserFunctions"

export interface AuthenticationClass {
    createAccount: (newUserData: NewUser, idGenerator?: (newUserData?: NewUser) => string) => Promise<string[] | boolean | undefined>
    tryLogin: (username: string, password: string, applicationName: string, deviceDetails: TwoFactorClientData) => Promise<boolean | string | null>
    tryResolveTwoFactor: (userID: string, applicationName: string, deviceDetails: TwoFactorClientData, code: string, timestamp: number) => Promise<boolean>
    getTwoFactorRequestData: (id: string) => Promise<TwoFactorQue | null>
    updateAccount: (userID: string, authDevice: TwoFactorClientData, userOldRawPassword: string, newData: NewUserUpdate) => Promise<boolean | null>
}

export class AuthenticationHandler implements AuthenticationClass {
    private passwordConfig?: PasswordConfig;
    private usernameConfig?: UsernameConfig;
    constructor(passwordConfig?: PasswordConfig, usernameConfig?: UsernameConfig, _emailConfig?: any) {
        this.passwordConfig = passwordConfig;
        this.usernameConfig = usernameConfig;
    }
    async createAccount(newUserData: NewUser, idGenerator?: ((newUserData?: NewUser | undefined) => string) | undefined) {
        const passwordResult = passWordCheck(newUserData.password, this.passwordConfig);
        if (!passwordResult.isValid) return passwordResult.errorMessage;
        const emailResult = validateEmail(newUserData.email);
        if (!emailResult.isValid) return emailResult.errorMessage;
        const usernameResult = usernameValidator(newUserData.username, this.usernameConfig);
        if (!usernameResult.isValid) return usernameResult.errorMessage;
        else return (await createSingleUser(newUserData, idGenerator)).isValid;
    }
    async tryLogin(username: string, password: string, applicationName: string, deviceDetails: TwoFactorClientData) {
        const isValid = await verifyPassword(username, deviceDetails, password)
        if (isValid === undefined) {
            const twoFactorString = await generateTwoFactorQuery(username, applicationName, deviceDetails)
            return twoFactorString;
        }
        else if (isValid === null) return null;
        else return isValid;
    }
    async updateAccount(userID: string, authDevice: TwoFactorClientData, userOldRawPassword: string, newData: NewUserUpdate) {
        return tryUpdateUser(userID, authDevice, userOldRawPassword, newData)
    }
    async requestDeleteAccount(userID: string) { return deleteUsersByID([userID]); }
    async tryResolveTwoFactor(userID: string, applicationName: string, deviceDetails: TwoFactorClientData, code: string, timestamp: number) {
        try {
            const twoFactorData = await findTwoFactorQuery(undefined, { userID, applicationName, deviceDetails })
            if (twoFactorData === null) return false
            else if (!objectsEqual(JSON.parse(twoFactorData.deviceData as string ?? '{}'), deviceDetails)) return false;
            const codeMatch = await checkTwoFactorCode(userID, code, timestamp)
            if (codeMatch) {
                await removeTwoFactorQuery(twoFactorData.id);
                await addAuthDevice(userID, deviceDetails);
                return true
            }
            return false
        } catch (error) {
            console.error(error)
            return false
        }
    }
    async getTwoFactorRequestData(id: string) {
        try {
            return await prisma.twoFactorQue.findFirst({
                where: {
                    OR: [{ id }, { userID: id }]
                }
            })
        } catch (error) {
            return null
        }
    }
    async clearTwoFactorQuery() { return trimTwoFactorRequest(); }
}