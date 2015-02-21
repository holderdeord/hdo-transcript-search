import moment from 'moment';
moment.locale('nb');

export default class TimeUtils {
    static timestampForHit(hit) {
        let ts = moment(hit.time);

        if (hit.name === 'Presidenten' && ts.format('HH.mm') == '00.00') {
            return ts.format('LL kl. ??.??');
        } else {
            return ts.format('LLL');
        }
    }

    static formatHitDate(hit) {
        moment(hit.time).format('LL');
    }

    static formatHitTime(hit) {
        let ts = moment(hit.time);
        let str = ts.format('HH.mm');

        if (hit.name === 'Presidenten' && str == '00.00') {
            return '??.??';
        } else {
            return str;
        }
    }
}
