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

