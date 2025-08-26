import Modal from '/js/classes/Modal.js';
import Toast from '/js/classes/Toast.js';
import * as View from '/js/views/view.js';

/**
 * Ask the user for audio permission.
 * @param {Function|null} [onGranted] A callback if the user accept.
 * @param {Function|null} [onPrompt]  A callback if the user does not answer.
 * @param {Function|null} [onDenied]  A callback if the user refuse.
 */
export function grant(onGranted = null, onPrompt = null, onDenied = null)
{
    navigator.mediaDevices.getUserMedia({ audio: true })
        // On granted.
        .then((stream) => {
            // window.audioStream = stream;
            onGranted?.call();
            console.info("🎤 Audio permission granted.");
        })
        .catch((error) => {
            // TODO Handle the other possible errors.
            navigator.permissions.query({ name: 'microphone' })
                .then((permissionStatus) => {
                    // On prompt.
                    if (permissionStatus.state === 'prompt') {
                        onPrompt?.call();
                        console.warn("🔇 Audio permission unknown.");
                    }
                    // On denied.
                    else if (permissionStatus.state === 'denied') {
                        onDenied?.call();
                        console.error("🔇 Audio permission denied.");
                    }
                });
        });
}

/**
 * Check if the user granted the audio permission.
 * @param {Function|null} [onGranted] A callback if the permission was granted.
 * @param {Function|null} [onUnknown] A callback if the permission has not been granted yet.
 * @param {Function|null} [onDenied]  A callback if the permission was denied.
 */
export function check(onGranted = null, onUnknown = null, onDenied = null)
{
    navigator.permissions.query({ name: 'microphone' })
        .then((permissionStatus) => {
            // On granted.
            if (permissionStatus.state === 'granted') {
                onGranted?.call();
            }
            // On prompt.
            else if (permissionStatus.state === 'prompt') {
                onUnknown?.call();
            }
            // On denied.
            else {
                onDenied?.call();
            }
        });
}

/**
 * Open the modal asking the audio permission to the user.
 */
export function openPromptModal()
{
    let title = "Accès au microphone";
    let text = `<p><b>${ENV.APP.NAME}</b> a besoin de l'accès au microphone de votre appareil pour analyser le son ambiant.</p>
                <p>Sans votre autorisation, certains outils comme le sonomètre ou l'analyseur de fréquences ne pourront pas fonctionner.</p>`;

    (new Modal(title, text))
        .setPrimaryBtn(`Accorder l'accès <g-icon data-name="mic" class="right"></g-icon>`, () => {
            grant(
                () => {
                    Modal.close();
                    View.run();
                    (new Toast("Accès au microphone accordé.")).show();
                },
                null,
                () => {
                    Modal.close().then(() => openDenyModal());
                }
            );
        })
        .setSecondaryBtn(null)
        .setContext('view')
        .open();
}

/**
 * Open the modal explaining that the audio permission was denied.
 */
export function openDenyModal()
{
    let title = `<g-icon class="red" data-name="mic_off" data-x=-2 data-y=2></g-icon> Accès au microphone refusé`;
    let text = `<p>L'outil que vous essayez de lancer ne peut pas fonctionner, car vous n'avez pas autorisé <b>${ENV.APP.NAME}</b> a accéder au microphone de votre appareil.</p>
                <p>Pour que tous les outils fonctionnent à nouveau, veuillez ouvrir l'application dans votre navigateur, et autoriser manuellement l'accès au microphone ou réinitialiser toutes les autorisations.</p>`;

    (new Modal(title, text))
        .setPrimaryBtn(`Ouvrir dans le navigateur <g-icon data-name="open_in_new" class="right"></g-icon>`, () => {
            window.open(ENV.URL, '_blank');
            Modal.close();
        })
        .setSecondaryBtn(null)
        .setContext('view')
        .open();
}
