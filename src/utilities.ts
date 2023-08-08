import { convertStringToNumber } from "@jabz/security-utils";
import hash from "object-hash"


export function getEnvVar() {
    return convertStringToNumber(hash(process.env?.DB_VAR ?? "default"))
}