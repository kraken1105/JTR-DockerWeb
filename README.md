# MyDockerWeb

MyDockerWeb consente di avviare e gestire tramite un'interfaccia web una serie di container docker avviati su un server che espone API REST. Tramite un file di configurazione (myconfig.json) è possibile create dei preset in modo tale da ridurre al minimo i settaggi di avvio sull'interfaccia web ed automatizzare le operazioni sul backend.

Il progetto è, pertanto, suddiviso in due parti:
- backend NodeJS/Express): consente l'esecuzione di container docker. L'interfacciamento con il docker engine avviene mediante le API mydockerjs ( https://github.com/giper45/docker-js ).
- frontend Angular: consente l'interfacciamento con il backend.

## Getting Started

Per testare il progetto, clonare la repo
```
git clone https://github.com/kraken1105/MyDockerWeb.git
```

Quindi installare le dipendenze del server ed avviarlo:
```
cd server
sudo npm install
sudo node index.js
```

Allo stesso modo installare le dipendenze del client ed avviarlo:
```
cd client
sudo npm install
ng serve
```

L'interfaccia è raggiungibile all'indirizzo
```
localhost:4200/
```

### Prerequisites

E' richiesta la presenza del docker engine.

## Aggiungere o modificare i preset

Tutti i preset sono contenuti nel file myconfig.json caricato all'avvio sia dal backed che dal frontend.


