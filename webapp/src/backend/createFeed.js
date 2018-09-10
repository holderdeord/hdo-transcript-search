import RSS from 'rss';
import UrlUtils from '../shared/UrlUtils';
import url from 'url';

function newUrl(current, query) {
    let newQuery = Object.assign({}, current.query, query);
    let resultUrl = Object.assign({}, current, { query: newQuery });

    delete resultUrl.search;

    return url.format(resultUrl);
}

export default function createFeed(opts) {
    let { baseUrl, imageUrl, absoluteUrl, results, query } = opts;
    let links = {};

    let start = +(query.start || 0);
    let currentUrl = url.parse(absoluteUrl, true);
    let hitCount = results.hits.length;
    let totalCount = results.counts.total;

    links.first = newUrl(currentUrl, { start: 0 });
    links.last = newUrl(currentUrl, {
        start: totalCount - (totalCount % hitCount),
    });

    if (totalCount > hitCount + start) {
        links.next = newUrl(currentUrl, { start: start + hitCount });
    }

    /* eslint-disable */
    let feed = new RSS({
        title: `Innlegg om «${results.query}» - Sagt i salen - Holder de ord`,
        description: `Innlegg fra Stortinget som inneholder «${results.query}».`,
        feed_url: absoluteUrl,
        site_url: baseUrl,
        image_url: imageUrl,
        copyright: 'Holder de ord',
        language: 'no',
        categories: ['politics', 'parliament'],
        generator: 'tale.holderdeord.no',
        ttl: 60,

        // add pagination
        custom_elements: Object.keys(links).map(rel => {
            return {
                'atom:link': {
                    _attr: {
                        href: links[rel],
                        rel: rel,
                        type: 'application/rss+xml',
                    },
                },
            };
        }),
    });
    /* eslint-enable */

    results.hits.forEach(speech => {
        let name = speech.name;

        if (speech.party) {
            name += ` (${speech.party})`;
        }

        let title = `Innlegg fra ${name}`;

        feed.item({
            title: title,
            description: speech.text,
            url: `${baseUrl}${UrlUtils.speechPathFor(speech)}`,
            author: speech.name,
            date: speech.time,
        });
    });

    return feed.xml({ indent: true });
}
