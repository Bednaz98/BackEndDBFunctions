import prisma from "./primsaClient";
import { UserSystemProfiles } from "@prisma/client";
import { encryptText, decryptData } from "@jabz/security-utils";
import { getEnvVar } from "./utilities";
const userSystemProfileClient = prisma.userSystemProfiles;

export async function updateUserSystemProfiles(userData: UserSystemProfiles[]) {
    try {
        const validateNANumber = require("validate-na-number");
        const upsertTransactions = userData.map((e) => {

            let data = {
                profileID: e.profileID,
                firstName: e.firstName ? encryptText(e.firstName, true, `firstName-${getEnvVar()}`) : undefined,
                lastName: e.lastName ? encryptText(e.lastName, true, `lastName-${getEnvVar()}`) : undefined,
                username: e.username ? e.username : undefined,
                recoveryEmail: e.recoveryEmail ? encryptText(e.recoveryEmail, true, `recoveryEmail-${getEnvVar()}`) : undefined,
                mobileNumber: (e.mobileNumber && validateNANumber(e.mobileNumber)) ? encryptText(e.mobileNumber, true, `mobileNumber-${getEnvVar()}`) : undefined,
            }
            return userSystemProfileClient.upsert({
                where: { profileID: e.profileID },
                create: data,
                update: data,
            });
        });
        const result = await prisma.$transaction(upsertTransactions)
        return Boolean(result);
    } catch (error) {
        console.log(error)
        return null

    }

}


export async function getUserSystemProfileByID(userID: string[]): Promise<UserSystemProfiles[]> {
    const result = await userSystemProfileClient.findMany({
        where: { profileID: { in: userID } }
    });
    const transform: UserSystemProfiles[] = result.map((e) => {
        let keys = Object.keys(e)
        let values = Object.values(e).map((j, i) => j ? decryptData(j, true, `${keys[i]}-${getEnvVar()}`) : null);
        let reduced = keys.reduce((o, k, i) => (Object.assign(Object.assign({}, o), { [k]: values[i] })), {} as UserSystemProfiles);
        return { ...reduced, profileID: e.profileID, username: e.username }
    });
    return transform
}


// (async () => {
//     // @ts-ignore
//     await updateUserSystemProfiles([{ profileID: "36ef6c4c-3f25-4a27-b345-3143cb3959c4", mobileNumber: "1-(333)-333-3333" }])
//     const result = await getUserSystemProfileByID(["36ef6c4c-3f25-4a27-b345-3143cb3959c4"])
//     console.log(result)
// })()
