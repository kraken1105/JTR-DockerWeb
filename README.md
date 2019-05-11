# JTR-DockerWeb

Il progetto è suddiviso in due parti:
- backend NodeJS/Express (API REST): consente l'esecuzione di container docker con l'image 'John the Ripper', noto tool di cracking di psw ( https://hub.docker.com/r/knsit/johntheripper ). L'interfacciamento con docker avviene mediante le API mydockerjs ( https://github.com/giper45/docker-js ).
- [TO-DO] frontend AngularJS ...

## Getting Started

Per testare il progetto (per il momento solo il backend), clonare la repo
```
git clone https://github.com/kraken1105/JTR-DockerWeb.git
```

Quindi installare le dipendenze
```
cd server
sudo npm install
```

### Prerequisites

Il prerequisito richiesto è il docker engine.


## Examples

Avviare il server backend:
```
sudo node index.js
```
ed utilizzare un client come Postman per effettuare chiamate HTTP REST ai path
```
localhost:3000/jtr/
```
oppure
```
localhost:3000/jtr/:name
```

