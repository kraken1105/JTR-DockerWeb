# JTR-DockerWeb

Il progetto è suddiviso in due parti:
- backend NodeJS/Express (espone API REST): consente l'esecuzione di container docker con l'image 'John the Ripper', noto tool di cracking di psw ( https://hub.docker.com/r/knsit/johntheripper ). L'interfacciamento con docker avviene mediante le API mydockerjs ( https://github.com/giper45/docker-js ).
- frontend Angular: consente l'interfacciamento con il backend.

## Getting Started

Per testare il progetto, clonare la repo
```
git clone https://github.com/kraken1105/JTR-DockerWeb.git
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


