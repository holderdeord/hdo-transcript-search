export default class ImageUtils {
    static personImageFor(externalId) {
        if (externalId) {
            return `/images/${externalId}.jpg`;
        } else {
            return this.fallbackImage();
        }
    }

    static partyLogoFor(externalId) {
        return `/images/${externalId.toLowerCase()}.png`;
    }

    static fallbackImage() {
        return '/images/unknown.jpg';
    }
}
