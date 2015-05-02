export default class ImageUtils {
    static personImageFor(external_id) {
        if (external_id) {
            return `http://data.stortinget.no/eksport/personbilde?personid=${external_id}&storrelse=middels`;
        } else {
            return this.fallbackImage();
        }
    }

    static partyLogoFor(external_id) {
        return `https://www.holderdeord.no/api/parties/${external_id.toLowerCase()}/logo?version=medium`;
    }

    static fallbackImage() {
        return 'https://www.holderdeord.no/assets/representatives/unknown.jpg';
    }
}