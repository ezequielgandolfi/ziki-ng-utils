import { isNullOrUndefined } from "util";

let DATE_REGEX: RegExp = new RegExp('/^(\d{4})-(\d\d)-(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/');
let ONE_SECOND = 1000;
let ONE_MINUTE = (ONE_SECOND * 60);
let ONE_HOUR = (ONE_MINUTE * 60);
let ONE_DAY = (ONE_HOUR * 24);

export function getDate(value): Date {
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

export function getLocaleDateString(value): string {
    if (isNullOrUndefined(value))
        return '';
    let _dt = getDate(value);
    if (_dt instanceof Date)
        return _dt.toLocaleDateString();
    return '';
}

export function daysBetween(initialDate, finalDate): number {
    return Math.floor((getDate(finalDate).getTime() - getDate(initialDate).getTime()) / ONE_DAY);
}

export function isISODateString(value: string): boolean {
    return DATE_REGEX.test(value);
}