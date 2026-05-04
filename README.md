# DigiunoTimer

App web per la gestione del digiuno intermittente, installabile come PWA.

**Demo:** https://fappiudeveloper.github.io/digiunotimer/

## Funzionalità

- **8 schemi di digiuno**: 12:12, 14:10, 16:8, 18:6, 20:4, OMAD, 5:2, ADF
- **Timer circolare** in tempo reale con countdown
- **Storico** digiuni con badge completato/parziale e note
- **Statistiche** con grafici (ore settimanali, peso, distribuzione schemi)
- **Idratazione** — tracker 8 bicchieri giornalieri
- **Peso corporeo** — registro con delta visivo
- **Guida** — benefici, consigli, effetti collaterali
- **Notifiche browser** — avviso al completamento del digiuno
- **Tema chiaro/scuro**
- **PWA** — installabile su mobile e desktop
- **Dati locali** — tutto salvato in localStorage, nessun account

## Tech Stack

- HTML5 + CSS3 + Vanilla JS (nessun framework)
- [Chart.js](https://www.chartjs.org/) per i grafici
- Service Worker per offline e PWA
- GitHub Pages per l'hosting

## Deploy

Il sito viene pubblicato automaticamente su GitHub Pages tramite GitHub Actions ad ogni push su `main`.
