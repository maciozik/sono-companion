## 🧩 Features

### Sonomètre

- [ ] Exposimètre / Alerte au dépassement du maximum sur une période ?
- [ ] Affichage db(A), dB\(C), ...
- [ ] Affichage de marqueurs moyenne et maximum sur la jauge ?
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

- [ ] Utiliser la localisation de l'appareil pour trouver automatiquement la température extérieure ?
- [ ] Générateur de bruit blanc, bruit rose, sinus, etc... ?
- [ ] Référenceur de manuels ?

### Divers

- [ ] Héberger les fonts Google en local.

---

## ⚙️ Settings

### Global

- [ ] Changer pour des paramètres indépendants pour chaque vue ?
- [ ] **Pour toutes les vues :** choix de l'info à afficher dans le **nav tab** ?

### Tempo

- [ ] Choix des infos affichées ?

### Accessibilité

- [x] Thème contrasté.
  - [ ] Utiliser les view transitions pour switcher de thème ?
- [ ] Tout remettre en lowercase ?

---

## 💡 Autres idées

- [ ] **Style :** Changer l'icone play, pause et stop à l'intérieur des boutons en les slidant vers le haut ou le bas ?
- [ ] Notification Push lorsque l'application est mise en arrière-plan pour prévenir de la mise en pause, en plus du Toast ? (Service Worker nécessaire ?)
- [ ] Fixer un seul bouton play et les boutons secondaires en bas pour toutes les vues.

---

## 🐞 Bugs

- [ ] La statut-bar du téléphone ne change pas de couleur en mode sombre.
- [ ] Bloquer l'orientation portrait en autorisant le 180° (`"orientation": "portrait"` n'autorise pas le 180°).
- [ ] Problème avec le multitap *(ex. tap en même temps sur les boutons* `play` *et* `replay` *de la vue **Tempo**)*.
- [ ] Le bouton `reset` du setting **Calibrage audio** fait remonter d'un pixel les boutons `reset` suivants **!?**
- [ ] Bouger le curseur à +30db sur le paramètre **Calibrage audio** change la taille du bloc info ?
- [ ] En relançant après une pause du sonomètre, le volume courant reviens à 0dB temporairement, le temps de recevoir les données audio.
  - Cause : re-création d'un nouvel AudioContext à chaque reprise ?
  - Créer un seul AudioContext au lancement de l'application ?
