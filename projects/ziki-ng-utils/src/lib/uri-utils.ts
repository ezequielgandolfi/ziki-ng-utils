import { isNullOrUndefined } from "util";
import { stringMask } from "./string-utils";

export function encodeURIParam(data: any): string {
    if (!isNullOrUndefined(data)) {
        if (data instanceof Boolean || typeof (data) === "boolean") {
            return data.toString();
        }
        if (data instanceof Date) {
            return [
                stringMask(data.getFullYear().toString(), '0000', { reverse: true }),
                stringMask((data.getMonth() + 1).toString(), '00', { reverse: true }),
                stringMask(data.getDate().toString(), '00', { reverse: true })
            ].join('-');
        }
        return encodeURIComponent(data);
    }
    return '';
}
