import hash from 'object-hash'
import prisma from "./primsaClient";
import { encryptText, decryptData } from '@jabz/security-utils';
import { getEnvVar } from './utilities';
import { TokenIDHashData, CompositeTokenData } from '@jabz/shared-auth';


const messageTokenClient = prisma.messagingToken


export async function saveToken(userData: TokenIDHashData, token: string) {
    try {
        const oldData = (await messageTokenClient
            .findFirst({ where: { userID: userData.userID } })
            .catch((e) => { console.error(e); return undefined })
            .then(e => e)
        )?.tokenData as CompositeTokenData | undefined;
        const newData = {
            ...oldData,
            [hash(userData)]: {
                token: encryptText(token, true, `messagingToken-${userData.userID}-${getEnvVar()}`),
                updateAt: Date.now(),
                app: userData.app
            }
        }
        const result = await messageTokenClient.upsert({
            where: { userID: userData.userID },
            create: { userID: userData.userID, tokenData: newData as any },
            update: { userID: userData.userID, tokenData: newData as any }
        })
        return Boolean(result)
    } catch (error) {
        console.log(error)
        return null
    }

}

export async function getUserToken(userID: string, app: string): Promise<string[] | null> {
    try {
        const userData = (await messageTokenClient.findFirst({ where: { userID: userID }, select: { tokenData: true } }))
        const tokeData: CompositeTokenData | null = userData?.tokenData as CompositeTokenData | null
        if (tokeData !== null) {
            const results = Object.values(tokeData)
                .filter((e) => (e.app === app))
                .sort((a, b) => (a.updateAt - b.updateAt))
                .map((e) => decryptData(e.token ?? "", true, `messagingToken-${userID}-${getEnvVar()}`));
            return results;
        }
        else return []
    } catch (error) {
        console.log(error)
        return null
    }
}
