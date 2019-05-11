
const express = require('express');
const bodyParser = require('body-parser');
const fse = require('fs-extra');
const jtrDocker = require('./lib/jtr-docker');

const app = express();
	//.use(bodyParser.json);



//----- Avvio server -----//

port = process.env.PORT || 3000;	
app.listen(port, (err) => {
	if(err) return console.log(err);	
	console.log(' Server avviato sulla porta '+port+'...');
});





//----- Routes -----//
		app.route('/').get((req,res) => {
			res.sendFile('test.html', {root: __dirname});
		});

//--- Collezione (POST non implementata)
// GET
app.route('/jtr').get((req,res) => {	
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
			
			res.sendStatus(200); // ok
		}
	});
});

// PUT
app.route('/jtr/').put((req,res) => {
	// ferma (senza cancellare) tutte le VMs
	jtrDocker.docker.stopAll(function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			res.sendStatus(200); // ok
		}
	});	
});


//--- Elemento
// GET
app.route('/jtr/:name').get((req,res) => {
	
	jtrDocker.docker.getInfoContainer(req.params.name, function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			let jsonToSend = {}
			jsonToSend.State = (JSON.parse(data))["State"];
			console.log(' Container '+req.params.name+' state:\n'+jsonToSend.State);
			  
			// recupera anche il file contenente l'output della console del container
			let out_console_file = __dirname+'/mount_dirs/out/'+req.params.name+'/out_console.txt';
			jsonToSend.outConsole = fse.readFileSync(out_console_file, "utf8");
			
			res.json(jsonToSend);
		}
	});
});

// POST -?
app.route('/jtr/:name').post((req,res) => {
	
	//---- [TO-DO] salva file psw come "download" in mount_dirs ////////////////////////////////////////////////////
	
	//---- [TO-DO] preleva dal post i parametri da passare a john (cmd) ////////////////////////////////////////////////////

	//---- [TO-DO] si potrebbe consentire all'utente di effettuare l'upload di un dizionario  ////////////////////////////////////////////////////

	let name = req.params.name;	
	let in_dir = __dirname+'/mount_dirs/in/'+name;
	let out_dir = __dirname+'/mount_dirs/out/'+name;

	// Controllo se non esiste già un container con lo stesso nome
	if (fse.existsSync(in_dir)) {
		console.log(' [WARNING] Container con nome '+name+' già esistente!');
		res.send('Container con nome '+name+' già esistente! Cancellalo prima di eseguirne un altro con lo stesso nome')
	}
	
	fse.mkdirSync(in_dir);			// creo la cartella da montare in input
	fse.mkdirSync(out_dir); 		// creo la cartella da montare in out
	fse.chmodSync(out_dir,0o777);	// cambio i permessi così che il container possa accedere in scrittura
	fse.copySync(__dirname+'/mount_dirs/default_in', in_dir)		// inizializzo la cartella di input con i file di default
	fse.copySync(__dirname+'/mount_dirs/download', in_dir+'/psw')	// inizializzo la cartella di input con il file delle psw
	
	jtrDocker.runJtR_withName(name, in_dir, out_dir,
		function(err, data) {if(err) {  
		  console.log("Some err:") 
		  console.log(data)
		  console.log('esecuzione container '+name+' interrotta con errore');
		}   
		else { 
		  console.log(data)
		  console.log('esecuzione container '+name+' terminata');
		}   
	  });
	res.sendStatus(200); // ok
});

// DELETE
app.route('/jtr/:name').delete((req,res) => {
	// ferma e cancella la VM (anche non terminata) con nome req.params.name
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

			res.sendStatus(200); // ok
		}
	}, true);
});

// PUT
app.route('/jtr/:name').put((req,res) => {
	// ferma (senza cancellare) la VM con nome req.params.name
	jtrDocker.docker.stop(req.params.name, function(err, data) {
		if (err) {
			console.log("Some err:")
		  	console.log(data)
		  	res.sendStatus(404);
		}
		else {
			res.sendStatus(200); // ok
		}
	});
});
