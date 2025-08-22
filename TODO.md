## 🧩 Features

### Sonomètre

- [ ] Exposimètre / Alerte au dépassement du maximum sur une période ?
- [ ] Le volume devrait s'afficher (et être pris en compte) même si la jauge est au maximum.
- [ ] Affichage db(A), dB\(C), ...
- [ ] Histogramme de volume sur les dernières secondes ?

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

### Divers

- [ ] Héberger les fonts Google en local.

---

## ⚙️ Settings

### Global

- [ ] Changer pour des paramètres indépendants pour chaque vue ?
- [ ] **Pour toutes les vues :** choix de l'info à afficher dans le **nav tab** ?

### Sonomètre

- [ ] Écart entre les graduations de 5, 10 ou 20 dB ?
- [ ] Temps de refresh des infos.
  - Peut-être passer en real-time pour la valeur courante si le temps de refresh devient long.

### Tempo

- [ ] Choix des infos affichées ?

---

## 💡 Autres idées

- [ ] **Style :** Changer l'icone play, pause et stop à l'intérieur des boutons en les slidant vers le haut ou le bas ?
- [ ] Convetisseur mètres → delay en ms / ms → bpm.
  - Rendre cliquable les différentes unités pour converstion ? **Besoin d'enlever les limites dans ce cas.**
- [ ] Connexion à Spotify et autres plateformes musicales ?

---

## 🐞 Bugs

- [ ] La statut-bar du téléphone ne change pas de couleur en mode sombre.
- [ ] Bloquer l'orientation portrait en autorisant le 180° (`"orientation": "portrait"` n'autorise pas le 180°).
- [ ] Problème avec le multitap *(ex. tap en même temps sur les boutons* `play` *et* `replay` *de la vue **Tempo**)*.
- [ ] Le bouton `reset` du setting **Calibrage audio** fait remonter d'un pixel les boutons `reset` suivants **!?**
- [ ] Bouger le curseur à +30db sur le paramètre **Calibrage audio** change la taille du bloc `data-info` ?
