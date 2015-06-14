export default class ImageUtils {
    static personImageFor(external_id) {
        if (external_id) {
            return `/images/${external_id}.jpg`;
        } else {
            return this.fallbackImage();
        }
    }

    static partyLogoFor(external_id) {
        return `/images/${external_id.toLowerCase()}.png`;
    }

    static fallbackImage() {
        return '/images/unknown.jpg';
    }
}