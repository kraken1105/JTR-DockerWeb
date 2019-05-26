
const _ = require('underscore');
const fse = require('fs-extra');
const docker = require ('mydockerjs').docker;

module.exports = {
  docker,

  myRun: function (image, flagsDocker, callback, cmdContainer) {
    const flagsProto = {
      detached: true,
      rm: true
    };

    let flagsParams = _.extend({}, flagsProto, flagsDocker);
    
    let myFlags = '';
    if (flagsParams.rm)
      { myFlags += ' --rm '; }
    if ( ("in-dir" in flagsParams) && ("in-dir-container" in flagsParams) )
      {
        if((flagsParams["in-dir"] != 'undefined') && (flagsParams["in-dir-container"] != 'undefined'))
          myFlags += ` -v ${flagsParams["in-dir"]}:${flagsParams["in-dir-container"]} `
      }
    if ( ("out-dir" in flagsParams) && ("out-dir-container" in flagsParams) )
      {
        if((flagsParams["out-dir"] != 'undefined') && (flagsParams["out-dir-container"] != 'undefined'))
          myFlags += ` -v ${flagsParams["out-dir"]}:${flagsParams["out-dir-container"]} `
      }
    
    flagsParams = _.omit(flagsParams, 'rm', 'in-dir', 'in-dir-container', 'out-dir', 'out-dir-container');

    // Costruisco i parametri necessari all'interfacciamento con mydockerjs
    let first = `${myFlags} --entrypoint "" ${image}`;
    flagsParams.cmd = '/bin/sh -c "'+cmdContainer+'"';
    
    // Run
    return docker.run(`${first}`, callback, flagsParams);
  },

  myGetContainerInfo: async function (myconfig, default_append_cmd, server_mount_dirs_out, containerList, containerIndex, next) {
    let container = containerList[containerIndex];

    // controllo se il container fosse in esecuzione l'ultima volta che è stato richiesto
	  if(container.running) {
      
      // A) Inizio a costruire il container aggiornato
	  	let newContainer = container;		
    
      // B) controllo se è ancora in esecuzione      
	  	await docker.getInfoContainer(container.name,
	  		function(err, data) 
	  		{
          if (err) newContainer.running=false;
          else newContainer.running=true;
          let out_console_path = server_mount_dirs_out+'/'+container.name;
	  			// C) recupero l'outConsole aggiornato (consulto il myconfig per eventuale path custom)
	  			if(myconfig.images.find(cs => cs["name"]==container.image)['serverConfig'] != undefined) {
	  				let currentServerConfig = myconfig.images.find(cs => cs["name"]==container.image)['serverConfig'];
	  				if(currentServerConfig['to-append-cmd'] != undefined) 
	  					out_console_path += currentServerConfig['to-append-cmd'].replace(/[\/].*[\/]/,"/");
	  				else
              out_console_path += default_append_cmd.replace(/[\/].*[\/]/,"/");
          } else
            out_console_path += default_append_cmd.replace(/[\/].*[\/]/,"/");
          newContainer.outConsole = fse.readFileSync(out_console_path, "utf8");       
          // D) restituisco il container aggiornato
          next(newContainer);
	  		}
      );   
      
	  } else {
      // altrimenti restituisco la stessa copia del container senza aggiornare le info
      next(container);
	  }
  },

  myStopContainer: async function (server_mount_dirs_in, server_mount_dirs_out, containerList, containerIndex, deleteFile) {
    let container = containerList[containerIndex];

    /* 2) Fermo il container (nell'eventualità fosse in esecuzione) */
    await docker.stop("-t 0 "+container.name, 
      function(err, data) {
        /* 3) Se deleteFile è true, allora bisogna rimuovere anche i mount associati */
        if(deleteFile) {
          fse.removeSync(server_mount_dirs_in+'/'+container.name);
		      fse.removeSync(server_mount_dirs_out+'/'+container.name);
        }  
      }
    );
  }



}