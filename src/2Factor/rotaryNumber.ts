import { convertStringToNumber } from '@jabz/security-utils';
import hash from 'object-hash'
/** default 5 minutes*/
export function getTFTimeDevisor() {
    return 5 * 60
}

/** input time in milliseconds, same as Date.now */
export function roundTime(inputTime: number) {
    const seconds = ((inputTime / 1000)) / getTFTimeDevisor();
    return Math.trunc(seconds)
}

export function getTFKey() {
    const key = 'TestingKeys'
    return hash(key)
}


export function getHashFactor(inputID: string, value: number, length: number = 6) {
    let hashArray: number[] = []
    for (let i = 0; i < length; i++) {
        const hashString = hash({ inputID, key: getTFKey(), rotary: value, i, change: i * value })
        hashArray.push(convertStringToNumber(hashString) % 10)
    }
    return hashArray
}





