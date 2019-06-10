# Docker Hacking Tools

Docker Hacking Tools è una web application che consente di lanciare e controllare molteplici container docker in esecuzione su un server. Nello specifico, tutti i container sono lanciati con l’opzione –rm, il che consente di eseguire un qualsiasi tool (per il quale esista una docker image associata) alla stregua di un comando eseguito in un terminale.

Docker Hacking Tools è una web application sviluppata conformemente allo stile architetturale Representational State Transfer (REST), molto comune nell’ambito dei sistemi distribuiti. Nello specifico, sono stati sviluppati due sotto-sistemi che utilizzano un sistema di comunicazione completamente basato su HTTP e per il quale non sono stati previsti meccanismi di autenticazione e di protezione del canale.

Questi due sotto-sistemi consistono in:
- un back-end sviluppato tramite il noto framework web Express basato sul runtime di JavaScript Node.js. Esso risiede sulla stessa macchina su cui è presente il docker engine, e si interfaccia con esso tramite la libreria docker-js ( https://github.com/giper45/docker-js ).
- un front-end sviluppato tramite la piattaforma Angular che gestisce l’interazione con l’utente e le funzionalità implementate dal back-end.

## Prerequisites

Gli unici prerequisiti richiesti per il funzionamento dell’applicazione sono:
- il docker engine: necessario lato server per l’avvio, l’esecuzione e la gestione dei vari
container; disponibile gratuitamente sul sito ufficiale ( https://hub.docker.com/search/?type=edition&offering=community ).
- un browser web qualsiasi: necessario lato client per l’interfacciamento con le funzionalità offerte.

## Getting Started

Per testare il progetto, clonare la repo
```
git clone https://github.com/kraken1105/MyDockerWeb.git
```

Quindi installare le dipendenze del back-end ed avviarlo:
```
cd server
sudo npm install
sudo node server.js
```

Allo stesso modo installare le dipendenze del front-end ed avviarlo:
```
cd client
sudo npm install
ng serve
```

L'interfaccia è raggiungibile all'indirizzo
```
localhost:4200/
```

