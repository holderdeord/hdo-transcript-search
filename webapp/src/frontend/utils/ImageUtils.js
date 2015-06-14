export default class ImageUtils {
    static personImageFor(external_id) {
        if (external_id) {
            return `/images/${external_id}.jpg`;
        } else {
            return this.fallbackImage();
        }
    }

    static partyLogoFor(external_id) {
        return `https://www.holderdeord.no/api/parties/${external_id.toLowerCase()}/logo?version=large`;
    }

    static fallbackImage() {
        return 'https://www.holderdeord.no/assets/representatives/unknown.jpg';
    }
}