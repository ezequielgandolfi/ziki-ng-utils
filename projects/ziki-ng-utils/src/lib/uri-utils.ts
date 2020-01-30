import { isNullOrUndefined } from "util";
import { ZikiMaskBuilder } from "./string-utils";

export class ZikiUriUtils {
    public static encodeURIParam(data: any): string {
        if (!isNullOrUndefined(data)) {
            if (data instanceof Boolean || typeof (data) === "boolean") {
                return data.toString();
            }
            if (data instanceof Date) {
                return [
                    ZikiMaskBuilder.string('0000', { reverse: true }).apply(data.getFullYear().toString()),
                    ZikiMaskBuilder.string('00', { reverse: true }).apply((data.getMonth() + 1).toString()),
                    ZikiMaskBuilder.string('00', { reverse: true }).apply(data.getDate().toString())
                ].join('-');
            }
            return encodeURIComponent(data);
        }
        return '';
    }
}

