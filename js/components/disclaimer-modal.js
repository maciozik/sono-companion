import Modal from '/js/classes/Modal.js';

export function show() {

    let title = "Avertissement";

    let text = /*html*/`
        <div style="font-size: .9em;">
            <p><b data-w=700>${ENV.APP.NAME}</b> est une application gratuite développée par des amateurs de musique et de son.</p>
            <p>En raison des algorithmes utilisés et de la diversité technique des appareils sur lesquels l'application peut être installée, les mesures fournies pourraient dans certains cas s'avérer approximatives, voire inexactes.</p>
            <p>Par conséquent, ${ENV.APP.NAME} ne saurait remplacer un équipement professionnel, et ne <b data-w=700>devrait pas</b> être utilisé dans un contexte où la précision des mesures est importante.</p>
            <p>Aussi, même dans un cadre amateur ou privé, il est recommandé de calibrer correctement l'application en s'alignant sur la mesure d'un sonomètre externe certifié. Pour ce faire, veuillez utiliser le réglage <b data-w=700>Calibrage audio</b>.</p>
            <p>Les développeurs de ${ENV.APP.NAME} ne sauraient être tenus responsables de tout dommage ou blessure résultant de l'utilisation de cette application.</p>
        </div>
    `;

    (new Modal(title, text))
        .setPrimaryBtn("J'ai compris", () => Modal.close())
        .setSecondaryBtn(null)
        .open();
}
