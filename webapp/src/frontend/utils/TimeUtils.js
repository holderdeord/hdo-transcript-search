import Intervals from '../constants/Intervals';
import moment from 'moment';

moment.locale('nb');

const DATE_FORMATS = {
    [Intervals.MONTH]: 'MMM YYYY',
    [Intervals.THREE_MONTHS]: 'MMM YYYY',
    [Intervals.SIX_MONTHS]: 'MMM YYYY',
    [Intervals.YEAR]: 'YYYY',
};

export default class TimeUtils {
    static timestampForHit(hit) {
        return moment(hit.time).format('LL');
    }

    static formatHitDate(hit) {
        return moment(hit.time).format('LL');
    }

    static formatHitTime(hit) {
        let ts = moment(hit.time);
        let str = ts.format('HH.mm');

        if (hit.name === 'Presidenten' && str === '00.00') {
            return '??.??';
        } else {
            return str;
        }
    }

    static formatIntervalLabel(str, interval) {
        return moment(str).format(DATE_FORMATS[interval]);
    }
}
