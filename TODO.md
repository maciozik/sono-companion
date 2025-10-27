## 🧩 Features

### Sonomètre

- [ ] Exposimètre / Alerte au dépassement du maximum sur une période ?
- [ ] Affichage db(A), dB\(C), ...
- [ ] Histogramme de volume sur les dernières secondes ?
- [ ] Déplacer l'aiguille de la jauge en fonction du max local et pas en continu ?
  - Ou ne pas déplacer en cas de faibles changements ?

### Spectre

- [ ] Spectre en fréquences / 31 bandes.
- [ ] Affichage du pic le plus haut en temps réel.
- [ ] Affichage temporaire des derniers pics atteints en tout point du spectre ?
- [ ] Spectogramme ?

### Tempo

- [ ] Molette pour sélectionner le bpm (en glassmorphism ?).
  - Clic / maintien sur le bpm pour faire apparaître la molette ?
- [ ] Tempo tap à améliorer ?
  - Enlever les extrêmes ?
  - Prendre en compte seulement les derniers ?
  - Seulement s'ils sont très différents ?
- [ ] Auto détection du tempo ? *(comme [bpmtech.no](https://bpmtech.no))*
- [ ] Alterner couleur du header pour visualiser le tempo, à la place du blink ?

### Outils annexes

- [x] Convertisseur bpm ↔ ms.
- [x] Convertisseur distance ↔ delay.
  - Pouvoir renseigner la température pour une meilleur précision de la vitesse du son ?
    - $c = 20,05 \sqrt{T(K)}$ avec $T(K)$ la température en kelvin tel que $T(K) = T(°C) + 273.15$.
- [ ] Générateur de bruit blanc, bruit rose, sinus, etc...
- [ ] Bloc-note.

### Divers

- [ ] Héberger les fonts Google en local.

---

## ⚙️ Settings

### Global

- [ ] Changer pour des paramètres indépendants pour chaque vue ?
- [ ] **Pour toutes les vues :** choix de l'info à afficher dans le **nav tab** ?

### Tempo

- [ ] Choix des infos affichées ?

---

## 💡 Autres idées

- [ ] **Style :** Changer l'icone play, pause et stop à l'intérieur des boutons en les slidant vers le haut ou le bas ?
- [ ] Notification Push lorsque l'application est mise en arrière-plan pour prévenir de la mise en pause, en plus du Toast ? (Service Worker nécessaire ?)

---

## 🐞 Bugs

- [ ] La statut-bar du téléphone ne change pas de couleur en mode sombre.
- [ ] Bloquer l'orientation portrait en autorisant le 180° (`"orientation": "portrait"` n'autorise pas le 180°).
- [ ] Problème avec le multitap *(ex. tap en même temps sur les boutons* `play` *et* `replay` *de la vue **Tempo**)*.
- [ ] Le bouton `reset` du setting **Calibrage audio** fait remonter d'un pixel les boutons `reset` suivants **!?**
- [ ] Bouger le curseur à +30db sur le paramètre **Calibrage audio** change la taille du bloc `data-info` ?
- [ ] En relançant après une pause du sonomètre, le volume courant reviens à 0dB temporairement, le temps de recevoir les données audio.
  - Cause : re-création d'un nouvel AudioContext à chaque reprise ?
  - Créer un seul AudioContext au lancement de l'application ?
