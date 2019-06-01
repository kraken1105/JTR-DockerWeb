
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fse = require('fs-extra');
const _ = require('underscore');
const multipart = require('connect-multiparty');

const myDockerLib = require('./lib/myDockerLib');


// 1) Inizializzazione server
//-- Lettura parametri myconfig.json
	containerList = [];
	let raw_myconfig = fse.readFileSync('../myconfig.json');  
	const myconfig = JSON.parse(raw_myconfig);
		const server_mount_dirs_in  = __dirname+myconfig["serverGlobalConfig"]["in-dir"];
		const server_mount_dirs_out = __dirname+myconfig["serverGlobalConfig"]["out-dir"];
		const downloads_dir = __dirname+myconfig["serverGlobalConfig"]["downloads-dir"];
		const out_dir_container = myconfig["serverGlobalConfig"]["out-dir-container"];
		const default_append_cmd = myconfig["serverGlobalConfig"]["to-append-cmd"];

	console.log('Server configurato con:');
	console.log('  server_mount_dirs_in: '+server_mount_dirs_in);
	console.log('  server_mount_dirs_out: '+server_mount_dirs_out);
	console.log('  downloads_dir: '+downloads_dir);
	console.log('  out_dir_container: '+out_dir_container);
	console.log('  default_append_cmd: '+default_append_cmd);

//-- Inizializzazione
	const app = express();
		app.use(cors());
		app.use(bodyParser.json());  
		app.use(bodyParser.urlencoded({  
		    extended: true
		}));
	const multipartMiddleware  =  multipart({ uploadDir: downloads_dir });

// 2) Avvio server
port = process.env.PORT || 3000;	
app.listen(port, (err) => {
	if(err) return console.log(err);	
	console.log('Server avviato sulla porta '+port+'...');
});






//-------------------------- Routes --------------------------//
//--- Collezione (POST non implementata)
// GET
app.route('/api').get((req,res) => {
	console.log("    ["+Date.now()+"] GET /api/");

	for(let i=0; i<containerList.length; i++)
		myDockerLib.myGetContainerInfo(myconfig, default_append_cmd, server_mount_dirs_out, containerList, i, 
			function(newContainer) {
				// aggiorno il container in containerList
				containerList[i] = newContainer;
			}
		);

	res.json(containerList);
});

// DELETE
app.route('/api').delete((req,res) => {
	// ferma e cancella tutte le VMs (anche non terminate)
	console.log("    ["+Date.now()+"] DEL /api/");

	let containerListCopy = containerList.splice(0); // svuoto già il containerList e lavoro su una sua copia
	
	for(let i=0; i<containerListCopy.length; i++)
		myDockerLib.myStopContainer(server_mount_dirs_in, server_mount_dirs_out, containerListCopy, i, true);

	res.status(202).send('Container cancellati con successo');
});

// PUT
app.route('/api/').put((req,res) => {
	// ferma (senza cancellare) tutte le VMs
	console.log("    ["+Date.now()+"] PUT /api/");

	for(let i=0; i<containerList.length; i++) 
		myDockerLib.myStopContainer(server_mount_dirs_in, server_mount_dirs_out, containerList, i, false, undefined);

	res.status(202).send('Container fermati con successo');
});


//--- Elemento
// GET
app.route('/api/:name').get((req,res) => {

	console.log("    ["+Date.now()+"] GET /api/"+req.params.name);	
	
	/* 1) Controllo se il container esiste, altrimenti termina subito l'esecuzione */
	if(containerList.find(cs => cs["name"]==req.params.name) == undefined) {
		res.sendStatus(404); // not found
		return;
	}
	
	let containerIndex = containerList.indexOf(containerList.find(cs => cs["name"]==req.params.name));
	
	// 2) Verifico se devo aggiornare il container oppure se le info sono già disponibili
	myDockerLib.myGetContainerInfo(myconfig, default_append_cmd, server_mount_dirs_out, containerList, containerIndex, 
		function(newContainer) {
			// aggiorno il container in containerList
			containerList[containerIndex] = newContainer;

			// invio il container al client
			res.json(newContainer);
		}
	);
});

// POST
app.route('/api/:name').post(multipartMiddleware, (req,res) => {
	
	console.log("    ["+Date.now()+"] POST /api/"+req.params.name);
	/* Decommentare per ispezionare a video il contenuto della req:
	console.log(req.body, req.files); */
		
	
	/* 1) Prelevo i parametri dalla post */
	let name 			= req.params.name;
	let selImage 		= req.body.selImage;
	let txtImageCustom	= req.body.txtImageCustom;
	let txtCmd 			= req.body.txtCmd;
	let txtPathMountIn 	= req.body.txtPathMountIn;
	let numfileToUpload = req.body.numfileToUpload;
	let filesUploded = [];
	
	let in_dir  = server_mount_dirs_in+'/'+name;
	let out_dir = server_mount_dirs_out+'/'+name;
	let imageToRun = "";
	let currentServerConfig = undefined;


	/* 2) Controllo se esiste già un containerServer, in caso negativo inizializzo i path ed organizzo i file */
	if(containerList.find(cs => cs["name"]==name) != undefined) {

		console.log('      [WARNING] Container con nome '+name+' già esistente!');
		// rimuovo i file scaricati
		for(let i=0; i<numfileToUpload; i++) fse.removeSync(downloads_dir+"/"+req.files[i].path);
		// e notifico il client
		res.status(409).send('Container con nome '+name+' già esistente: rimuovere i dati associati e riprovare');
		return;

	} else {	
		
		// A) inizializzo la cartella di input...
		fse.mkdirSync(in_dir);				// creo la cartella da montare in input
			// ...con eventuali file di default (consulto il myconfig)
			if(selImage!='custom') {
				if(myconfig.images.find(cs => cs["name"]==selImage)['serverConfig'] != undefined) {
					currentServerConfig = myconfig.images.find(cs => cs["name"]==selImage)['serverConfig'];
					if(currentServerConfig['default-dir-to-copy-in-mount-in'] != undefined) {
						fse.copySync(__dirname+currentServerConfig["default-dir-to-copy-in-mount-in"], in_dir);
					}
				}
			}
			// ...con i file uploaded
			for(let i=0; i<numfileToUpload; i++) {
				filesUploded[i] = req.files[i];
				fse.renameSync(filesUploded[i].path, in_dir+'/'+filesUploded[i].name);		
			}		
		// B) inizializzo la cartella di output
		fse.mkdirSync(out_dir); 			// creo la cartella da montare in out
			fse.chmodSync(out_dir,0o777);	// cambio i permessi così che il container possa accedere in scrittura

	}
	
	/* 3) Preparo i parametri da passare a myRun()... */
	// A) ...flag per Docker
		// di default
		let flagsDocker = {
			'name': name,
			detached: true,
			rm: true,
			"in-dir": in_dir,
			"out-dir": out_dir,
			"out-dir-container": out_dir_container
		};	
		// verifico se devo usare qualche preset (consulto il myconfig)	
		if(currentServerConfig != undefined) {
			if(currentServerConfig['runParams'] != undefined) 
				flagsDocker = _.extend({}, flagsDocker, currentServerConfig.runParams);
		}
		// aggiungo o sovrascrivo i parametri specificati dall'utente
		if((txtPathMountIn != "") && (txtPathMountIn != null)) {
			flagsDocker = _.extend({}, flagsDocker, {"in-dir-container": txtPathMountIn});
		}

	// B) ...cmd del container
		// verifico se c'è qualche script da avviare prima del comando utente
		if(currentServerConfig != undefined) {
			if(currentServerConfig['default-script-in'] != undefined)
				txtCmd = flagsDocker["in-dir-container"]+'/'+currentServerConfig["default-script-in"]+' && '+txtCmd;
		}
		// appendo il comando di redirezione dell'output di default o custom se presente nel myconfig
		if(currentServerConfig != undefined) {
			if(currentServerConfig['to-append-cmd'] != undefined) 
				txtCmd += ' > '+currentServerConfig['to-append-cmd'];
			else
				txtCmd += ' > '+default_append_cmd;
		} else
			txtCmd += ' > '+default_append_cmd;
	
	
	/* 4) Seleziono la docker image da avviare */
	imageToRun = selImage=='custom' ?
		txtImageCustom : myconfig.images.find(cs => cs["name"]==selImage)['image'];
	

	/* 5) Aggiungo il container alla lista */
	containerList.push({
		'name':name,
		'running':true,
		'image':selImage,
		'outConsole':''
	});


	/* 6) Run */
	myDockerLib.myRun(imageToRun, flagsDocker, 
		function(err, data) {if(err) {
			console.log("Some err:") 
		  	console.log(data)
		  	console.log("    ["+Date.now()+"] container "+name+" interrotto con errore");
		  	res.status(503).send('Il server non è al momento in grado di soddisfare la richiesta');
		}   
		else {
			console.log("    ["+Date.now()+"] container "+name+" avviato con successo");
		  	res.status(202).send('Container avviato con successo');
		}}, txtCmd);
});

// DELETE
app.route('/api/:name').delete((req,res) => {
	// ferma la VM (se non terminata) con nome req.params.name e cancella i file associati
	console.log("    ["+Date.now()+"] DEL /api/"+req.params.name);	
	
	/* 1) Controllo se il container esiste, altrimenti termina subito l'esecuzione */
	if(containerList.find(cs => cs["name"]==req.params.name) == undefined) {
		res.sendStatus(404); // not found
		return;
	}
	
	let containerIndex = containerList.indexOf(containerList.find(cs => cs["name"]==req.params.name));

	/* 2) Fermo il container (nell'eventualità fosse in esecuzione) e cancello i mount */
	myDockerLib.myStopContainer(server_mount_dirs_in, server_mount_dirs_out, containerList, containerIndex, true);
	containerList.splice(containerIndex,1); // rimuovo il container dalla lista
	
	/* 3) Invio conferma al client */
	res.status(202).send('Container rimosso con successo');
	
});

// PUT
app.route('/api/:name').put((req,res) => {
	// ferma (senza cancellare i file associati) la VM con nome req.params.name
	console.log("    ["+Date.now()+"] PUT /api/"+req.params.name);

	/* 1) Controllo se il container esiste, altrimenti termina subito l'esecuzione */
	if(containerList.find(cs => cs["name"]==req.params.name) == undefined) {
		res.sendStatus(404); // not found
		return;
	}

	let containerIndex = containerList.indexOf(containerList.find(cs => cs["name"]==req.params.name));

	/* 2) Fermo il container (nell'eventualità fosse in esecuzione) */
	myDockerLib.myStopContainer(server_mount_dirs_in, server_mount_dirs_out, containerList, containerIndex, false);
	
	/* 3) Invio conferma al client */
	res.status(202).send('Container fermato con successo');
});
