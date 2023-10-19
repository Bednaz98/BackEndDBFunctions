import { getTFTimeDevisor } from '../src/2Factor/rotaryNumber'
import { checkTwoFactorCode, generateUserTwoFactorCode } from '../src/2Factor/twofactor'
import { NewUser, createSingleUser, verifyPassword } from '../src/'

(async () => {
    const id = "test@gmail.com";
    const authDevice = {
        appName: 'test',
        appID: 'test',
        os: 'test',
        deviceModel: 'test',
        deviceName: 'test'
    };
    const newUserData: NewUser = {
        email: id,
        password: 'test',
        authDevice,
    }
    //console.log(await createSingleUser(newUserData))
    // const timeStamp = Date.now()
    // const twoFactor = await generateUserTwoFactorCode(id, timeStamp) ?? ""
    // const result = await checkTwoFactorCode(id, twoFactor, timeStamp - (1 + getTFTimeDevisor() * 1000))
    // console.log(result)
    console.log(await verifyPassword(id, authDevice, "test"))


})();

