import { isNullOrUndefined } from "util";

export class ZikiDateUtils {

    private static readonly DATE_REGEX: RegExp = new RegExp('/^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/');

    public static ONE_SECOND = 1000;
    public static ONE_MINUTE = (ZikiDateUtils.ONE_SECOND * 60);
    public static ONE_HOUR = (ZikiDateUtils.ONE_MINUTE * 60);
    public static ONE_DAY = (ZikiDateUtils.ONE_HOUR * 24);

    public static toDate(value): Date {
        let result: Date;
        if (value != null) {
            if (typeof (value) == 'string') {
                result = new Date(value);
                let timezoneOffset = (new Date()).getTimezoneOffset();
                let dateParts = value.split('T');
                if (dateParts.length == 2) {
                    let timePart = dateParts[1];
                    if (timePart.includes('-') || timePart.includes('+')) {
                        timezoneOffset = 0;
                    }
                }
                else {
                    let utcDate: Date = new Date(result.getUTCFullYear(), result.getUTCMonth(), result.getUTCDate());
                    result = new Date(utcDate);
                    timezoneOffset = 0;
                }
                if (timezoneOffset != 0) {
                    result = new Date(result.getTime() + (timezoneOffset * 60000));
                }
                return result;
            }
            return new Date(value);
        }
        return;
    }

    public static getLocaleDateString(value): string {
        if (isNullOrUndefined(value))
            return '';
        let _dt = ZikiDateUtils.toDate(value);
        if (_dt instanceof Date)
            return _dt.toLocaleDateString();
        return '';
    }

    public static daysBetween(initialDate: Date, finalDate: Date): number {
        return Math.floor((ZikiDateUtils.toDate(finalDate).getTime() - ZikiDateUtils.toDate(initialDate).getTime()) / ZikiDateUtils.ONE_DAY);
    }

    public static isISODate(value: string): boolean {
        return ZikiDateUtils.DATE_REGEX.test(value);
    }

}
