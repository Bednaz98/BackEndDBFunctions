import { convertStringToNumber } from "@jabz/security-utils";
import hash from "object-hash"


export function getEnvVar() {
    return convertStringToNumber(hash(process.env?.DB_VAR ?? "default"))
}

export function objectsEqual(a: any, b: any) {
    const arrayA = Object.values(JSON.parse(a?.authDevice as string ?? `{}`)?.['deviceData'] ?? {});
    const arrayB = Object.values(b)
    const resultArray1 = arrayA.map((e) => arrayB.includes(e)).every(e => e);
    const resultArray2 = arrayB.map((e) => arrayA.includes(e)).every(e => e);
    return resultArray1 && resultArray2
}

export enum UserCreationErrors {
    emailNotValid = 'email not valid',
    usernameShort = 'username too short',
    usernameLong = "username too long",
    userExist = "this username already exist",
    deviceDataMissing = "no device data received"
}

export interface UserCreationResults {
    isValid: boolean,
    errorMessage?: string[]
}

export function validateEmail(email: string): UserCreationResults {
    const validator = require("email-validator");
    const result: boolean = validator.validate(email)
    return {
        isValid: result,
        errorMessage: [UserCreationErrors.emailNotValid]
    }
}

export interface UsernameConfig {
    maxLength: number
    minLength: number
}

export function userNameValidator(username: string, usernameConfig?: UsernameConfig): UserCreationResults {
    const defaultConfig: UsernameConfig = {
        maxLength: 256,
        minLength: 6
    }
    const config = { ...defaultConfig, ...usernameConfig }
    if (username.length < config.minLength) return {
        isValid: false,
        errorMessage: [UserCreationErrors.usernameShort]
    }
    else if (username.length > config.maxLength) return {
        isValid: false,
        errorMessage: [UserCreationErrors.usernameLong]
    }
    return {
        isValid: true,
        errorMessage: []
    }
}

export interface PasswordConfig {
    allowPassphrases: boolean,
    maxLength: number
    minLength: number
    testPass?: number
}
export function passWordCheck(rawPassword: string, config?: PasswordConfig): UserCreationResults {
    const owasp = require('owasp-password-strength-test');
    const defaultConfig = {
        allowPassphrases: true,
        maxLength: 256,
        minLength: 10,
        minPhraseLength: 20,
        minOptionalTestsToPass: 4,
    }
    owasp.config({ ...defaultConfig, ...config });
    const result = owasp.test(rawPassword);
    return {
        isValid: result.strong as boolean,
        errorMessage: result.errors as string[]
    };
}