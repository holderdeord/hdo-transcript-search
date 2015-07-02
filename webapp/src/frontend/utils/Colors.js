const SERIES_CHARS = 'abcdefghijklmno'.split('');

module.exports = {
    colorAt: i => {
        let char = SERIES_CHARS[i >= SERIES_CHARS.length ? i - SERIES_CHARS.length : i];
        return 'hdo-label-' + char;
    }
};
