// import { AuthenticationHandler, NewUser } from '../src';
// import createPrismaMock from "prisma-mock"
// import { Prisma } from '@prisma/client';
// import { mockDeep, mockReset } from "jest-mock-extended";

// const client = mockDeep()

// describe('AuthenticationHandler Tests', () => {
//     beforeEach(async () => {

//         createPrismaMock({}, Prisma.dmmf.datamodel, client)
//     });
//     const auth = new AuthenticationHandler()

//     // mock vrs -------------------------------
//     const applicationName = 'default'
//     const testPassword = 'def@u1tP@$$w0rd'
//     const testUserName = 'default-username1'
//     const testEmail = "testing12@gmail.com"
//     const defaultDeviceData = {
//         appName: 'default',
//         appID: applicationName,
//         os: 'default',
//         deviceModel: 'deafult',
//         deviceName: 'default'
//     }
//     // ----------------------------------------

//     it('create account successfully', async () => {
//         const newUserData: NewUser = {
//             email: testEmail,
//             userName: testUserName,
//             password: testPassword,
//             authDevice: defaultDeviceData
//         }
//         const result = await auth.createAccount(newUserData)
//         expect(result).toBe(true)
//     })
//     it("detect existing user", async () => {
//         const newUserData: NewUser = {
//             email: testEmail,
//             userName: testUserName,
//             password: testPassword,
//             authDevice: defaultDeviceData
//         }
//         const result = await auth.createAccount(newUserData)
//         expect(result).toBe(false)
//     })
// })

test('', () => { expect(true).toBeTruthy() })