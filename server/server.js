
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const fse = require('fs-extra');
const multipart = require('connect-multiparty');

const jtrDocker = require('./lib/jtr-docker');

const app = express();
	app.use(cors());
	app.use(bodyParser.json());  
	app.use(bodyParser.urlencoded({  
	    extended: true
	}));

const multipartMiddleware  =  multipart({ uploadDir:  './mount_dirs' });



//----- Avvio server -----//

port = process.env.PORT || 3000;	
app.listen(port, (err) => {
	if(err) return console.log(err);	
	console.log('Server avviato sulla porta '+port+'...');
});





//----- Routes -----//
//--- Collezione (POST non implementata)
// GET
app.route('/jtr').get((req,res) => {
	console.log("    ["+Date.now()+"] GET /jtr/");
	jtrDocker.docker.ps(function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			let jsonToSend = [];
			let jsonTemp = JSON.parse(data);
			jsonTemp.forEach(element => {
				let elem_t = {}
				elem_t.Name = element.Names[0];
				elem_t.State = element.State;
				elem_t.Status = element.Status;
				
				// recupera anche il file contenente l'output della console del container
				let out_console_file = __dirname+'/mount_dirs/out'+element.Names[0]+'/out_console.txt';
				elem_t.outConsole = fse.readFileSync(out_console_file, "utf8");

				jsonToSend.push(elem_t);
			});
			  
			res.json(jsonToSend);
		}
	}, true);
});

// DELETE
app.route('/jtr').delete((req,res) => {
	// ferma e cancella tutte le VMs (anche non terminate)
	console.log("    ["+Date.now()+"] DEL /jtr/");
	jtrDocker.docker.rmAll(function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			// cancella tutte le directory di mount
			let in_dir = __dirname+'/mount_dirs/in';
			let out_dir = __dirname+'/mount_dirs/out';
			fse.removeSync(in_dir);
			fse.removeSync(out_dir);
			fse.mkdirSync(in_dir);
			fse.mkdirSync(out_dir);
			fse.chmodSync(in_dir, 0o777);
			fse.chmodSync(out_dir,0o777);
			
			res.status(202).send('Container cancellati con successo');
		}
	});
});

// PUT
app.route('/jtr/').put((req,res) => {
	// ferma (senza cancellare) tutte le VMs (impiega fino a 10 secondi)
	console.log("    ["+Date.now()+"] PUT /jtr/");
	jtrDocker.docker.stopAll(function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			res.status(202).send('Container fermati con successo');
		}
	});	
});


//--- Elemento
// GET
app.route('/jtr/:name').get((req,res) => {

	console.log("    ["+Date.now()+"] GET /jtr/"+req.params.name);	
	jtrDocker.docker.getInfoContainer(req.params.name, function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			let jsonToSend = {Name: "/"+req.params.name}
			jsonToSend.State = (JSON.parse(data))["State"].Status;
			jsonToSend.Status = (JSON.parse(data))["State"].Status;
			  
			// recupera anche il file contenente l'output della console del container
			let out_console_file = __dirname+'/mount_dirs/out/'+req.params.name+'/out_console.txt';
			jsonToSend.outConsole = fse.readFileSync(out_console_file, "utf8");
			
			res.json(jsonToSend);
		}
	});
});

// POST -?
app.route('/jtr/:name').post(multipartMiddleware, (req,res) => {
	
	console.log("    ["+Date.now()+"] POST /jtr/"+req.params.name);
		/* console.log(req.body, req.files);
  	var file = req.files["filePswUnshadowed"];
  	console.log(req.files.hasOwnProperty('fileDictionary')); */
	  
	//---- [TO-DO] preleva dal post i parametri da passare a john (cmd) ////////////////////////////////////////////////////

	let name = req.params.name;	
	let in_dir = __dirname+'/mount_dirs/in/'+name;
	let out_dir = __dirname+'/mount_dirs/out/'+name;

	// Controllo se non esiste già un container con lo stesso nome
	if (fse.existsSync(in_dir)) {
		console.log(' [WARNING] Container con nome '+name+' già esistente!');
		// rimuovo i file scaricati
		fse.removeSync(__dirname+"/"+req.files["filePswUnshadowed"].path);
		if(req.body.selectMod == "wordlist" && req.files.hasOwnProperty('fileDictionary'))
			fse.removeSync(__dirname+"/"+req.files["fileDictionary"].path);
		// e notifico il client
		res.status(409).send('Container con nome '+name+' già esistente: rimuoverlo e riprovare');
	}
	
	fse.mkdirSync(in_dir);			// creo la cartella da montare in input
	fse.mkdirSync(out_dir); 		// creo la cartella da montare in out
	fse.chmodSync(out_dir,0o777);	// cambio i permessi così che il container possa accedere in scrittura
	// inizializzo la cartella di input...
	fse.copySync(__dirname+'/mount_dirs/default_in', in_dir);									// ...con i file di default	
	fse.renameSync(__dirname+"/"+req.files["filePswUnshadowed"].path, in_dir+'/psw');			// ...con il file delle psw
	if(req.body.selectMod == "wordlist" && req.files.hasOwnProperty('fileDictionary'))
		fse.renameSync(__dirname+"/"+req.files["fileDictionary"].path, in_dir+'/password.lst');	// ...con l'eventuale dizionario	
	
	jtrDocker.runJtR_withName(name, in_dir, out_dir,
		function(err, data) {if(err) {
			console.log("Some err:") 
		  	console.log(data)
		  	console.log("    ["+Date.now()+"] container "+name+" interrotto con errore");
		  	res.status(503).send('Il server non è al momento in grado di soddisfare la richiesta');
		}   
		else {
			console.log(data)
		  	console.log("    ["+Date.now()+"] container "+name+" avviato con successo");
		  	res.status(202).send('Container avviato con successo');
		}   
	  });
});

// DELETE
app.route('/jtr/:name').delete((req,res) => {
	// ferma e cancella la VM (anche non terminata) con nome req.params.name
	console.log("    ["+Date.now()+"] DEL /jtr/"+req.params.name);
	jtrDocker.docker.rm(req.params.name, function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			// cancella le directory di mount
			let name = req.params.name;	
			let in_dir = __dirname+'/mount_dirs/in/'+name;
			let out_dir = __dirname+'/mount_dirs/out/'+name;
			fse.removeSync(in_dir);
			fse.removeSync(out_dir);
			res.status(202).send('Container rimosso con successo');
		}
	}, true);
});

// PUT
app.route('/jtr/:name').put((req,res) => {
	// ferma (senza cancellare) la VM con nome req.params.name
	console.log("    ["+Date.now()+"] PUT /jtr/"+req.params.name);
	jtrDocker.docker.stop("-t 0 "+req.params.name, function(err, data) { // il "-t 0" consente di killare istantaneamente un container
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			res.status(202).send('Container fermato con successo');
		}
	});
});
