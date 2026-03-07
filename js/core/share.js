import Toast from '/js/classes/Toast.js';

/**
 * Open the native share modal or copy the URL to the clipboard.
 */
export default () =>
{
    if (navigator.share) {
        navigator.share({
            title: ENV.APP.NAME,
            text : ENV.APP.DESCRIPTION,
            url  : ENV.URL
        });
    }
    else {
        navigator.clipboard.writeText(ENV.URL)
            .then(()  => (new Toast("Lien copié dans le presse-papier.")).show())
            .catch(() => (new Toast("Le lien n'a pas pu être partagé ni copié dans le presse-papier.")).show());
    }
}
