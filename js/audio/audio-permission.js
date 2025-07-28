import Modal from '../classes/Modal.js';

/**
 * Ask audio permission to the user.
 * @param {Function|null} [onGranted]
 * @param {Function|null} [onPrompt]
 * @param {Function|null} [onDenied]
 */
export function grant(onGranted = null, onPrompt = null, onDenied = null)
{
    navigator.mediaDevices.getUserMedia({ audio: true })
        // On granted.
        .then((stream) => {
            // window.audioStream = stream;
            if (onGranted !== null) onGranted();
        })
        .catch((error) => {
            navigator.permissions.query({ name: 'microphone' })
                .then((permissionStatus) => {
                    // On prompt.
                    if (permissionStatus.state === 'prompt') {
                        if (onPrompt !== null) onPrompt();
                    }
                    // On denied.
                    else if (permissionStatus.state === 'denied') {
                        if (onDenied !== null) onDenied();
                    }
                });
        });
}

/**
 * Whether or not the user granted the audio permission.
 * @param {Function|null} [isGranted] A callback if the permission is granted.
 * @param {Function|null} [isNotGranted] A callback if the permission is not granted yet or denied.
 */
export function isGranted(isGranted = null, isNotGranted = null)
{
    navigator.permissions.query({ name: 'microphone' })
        .then((permissionStatus) => {
            if (permissionStatus.state === 'granted') {
                if (isGranted !== null) isGranted();
            } else {
                if (isNotGranted !== null) isNotGranted();
            }
        });
}

/**
 * Open the modal that asks the audio permission to the user.
 */
export function openModal()
{
    let text = `<b>${ENV.APP.NAME}</b> a besoin de l'accès à votre microphone pour analyser le son ambiant.<br><br>
                Sans votre autorisation, certains outils comme le sonomètre ou l'analyseur de fréquences ne pourront pas fonctionner.`;

    (new Modal("Accès au microphone"))
        .setText(text)
        .setPrimaryBtn(`Accorder l'accès <g-icon data-name="mic" class="right"></g-icon>`, () => {
            grant(
                () => {
                    Modal.close();
                    // startAudio();
                },
                null,
                () => {
                    // TODO Display another modal to explain how reset permission.
                }
            );
        })
        .setSecondaryBtn(null)
        .setContext('view')
        .disallowClickOutside()
        .open();
}
