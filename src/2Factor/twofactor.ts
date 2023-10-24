import hash from "object-hash"
import prisma from "../primsaClient"
import { getHashFactor, getTFTimeDevisor } from "./rotaryNumber"
import { v4 } from "uuid"
import { TwoFactorClientData, DeviceTwoFactor } from "@jabz/shared-auth"



export function createNewAuthDevice(deviceInfo: TwoFactorClientData, isPrimaryDevice: boolean): DeviceTwoFactor {
    const newData: DeviceTwoFactor = {
        deviceData: deviceInfo,
        addedData: Date.now(),
        primary: isPrimaryDevice,
        id: `${deviceInfo.appName} - ${hash(deviceInfo)}`
    }
    return newData

}

export async function addAuthDevice(userID: string, deviceInfo: TwoFactorClientData, isPrimaryDevice?: boolean) {
    try {
        const userData = await prisma.user.findFirst({ where: { OR: [{ id: userID }, { email: userID }] } })
        if (userData) {
            //@ts-ignore
            const previousData = ((userData?.authDevice ?? {}) as DeviceTwoFactor[]).map((e) => JSON.parse(e))
            const prepData = isPrimaryDevice ? previousData.map((e) => ({ ...e, primary: false })) : previousData

            const newDeviceObject = createNewAuthDevice(deviceInfo, isPrimaryDevice ?? false)
            const temp: DeviceTwoFactor[] = [...prepData.filter((e) => !(e.id === newDeviceObject.id)), newDeviceObject]
            return (await prisma.user.updateMany({
                where: { OR: [{ id: userID ?? "" }, { email: userID ?? '' }] },
                data: { ...userData, authDevice: temp.map((e) => JSON.stringify(e)) }
            }));
        }
        return undefined

    } catch (error) {
        console.log(error)
        return null
    }
}

export async function generateUserTwoFactorCode(userID: string, timeStamp: number) {
    try {
        const userData = await prisma.user.findFirst({ where: { OR: [{ id: userID }, { email: userID }] } });
        if (userData) return getHashFactor(userData.id, timeStamp).join('');
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function checkTwoFactorCode(userID: string, code: string, timeStamp: number) {
    try {
        if (Date.now() > (timeStamp * getTFTimeDevisor() * 1000)) return false;
        else if ((await generateUserTwoFactorCode(userID, timeStamp)) === code) return true;
        else return false;
    } catch (error) {
        console.log(error);
        return null;
    }
}


export async function generateTwoFactorQuery(userID: string, applicationName: string, deviceData: TwoFactorClientData) {
    let foundQuery = null;
    try {
        foundQuery = await prisma.twoFactorQue.findMany({
            where: {
                OR: [
                    //@ts-ignore
                    { userID }, { deviceData: deviceData }
                ]
            }
        });
    } catch (error) {
        console.log(error);
    }
    if (foundQuery && foundQuery.length > 0) {
        return foundQuery.filter(e => (JSON.stringify(e.deviceData) == JSON.stringify(deviceData)) && (e.applicationName === applicationName))[0].id;
    }
    else {
        try {
            const newQuey = await prisma.twoFactorQue.create({
                data: {
                    id: v4(),
                    userID,
                    deviceData: JSON.stringify(deviceData),
                    timeStamp: BigInt(Date.now()),
                    applicationName,
                }
            })
            return newQuey.id;
        } catch (error) {
            return null
        }

    }

}
export async function removeTwoFactorQuery(QueryID: string) {
    try {
        return Boolean(await prisma.twoFactorQue.delete({ where: { id: QueryID } }))
    } catch (error) {
        console.log(error)
        return null
    }
}

export async function trimTwoFactorRequest() {
    const filterTime = 1000 * getTFTimeDevisor();
    const twoFactorQueries = (await prisma.twoFactorQue.findMany()).filter(e => e.timeStamp + BigInt(filterTime) < Date.now()).map(e => e.id)
    if (twoFactorQueries.length > 0) {
        return Boolean(await prisma.twoFactorQue.deleteMany({ where: { id: { in: twoFactorQueries } } }));
    }
    else return true;
}


export interface TwoFactorQuerySearch {
    userID: string
    applicationName: string
    deviceDetails: TwoFactorClientData
}
export async function findTwoFactorQuery(id?: string, search?: TwoFactorQuerySearch) {
    if (id !== undefined) return await prisma.twoFactorQue.findFirst({ where: { id } });
    else if (search) return await prisma.twoFactorQue.findFirst({
        where: {
            userID: search?.userID, applicationName: search?.applicationName,
            //@ts-ignore
            deviceData: JSON.stringify(search?.deviceDetails ?? {})
        }
    });
    else return null;
}