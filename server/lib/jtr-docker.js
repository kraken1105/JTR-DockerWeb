
const _ = require('underscore');
const docker = require ('mydockerjs').docker;

module.exports = {
  docker,

  /** - viene utilizzata di default la docker image 'knsit/johntheripper'
  * - nei paramsInput è possibile specificare i mount point di input e output dell'host,
  *   mappati rispettivamente in /in e /home/john/ del container.
  */
  runJtR: function (flagsDocker, callback, cmdDocker) {
    const flagsProto = {
      detached: true,
    };
    let flagsParams = _.extend({}, flagsProto, flagsDocker);
    
    let flags = '';
    let cmd = '/in/crack.sh';           // script di default che avvia jtr (e svolge alcune operazioni necessarie)
    let image = 'knsit/johntheripper';  // docker image con JtR lanciata di default 

    // Gestisco i due parametri di mount non gestiti dalla lib mydockerjs
    if (flagsParams.mount_in) { flags += ` -v ${flagsParams.mount_in}:/in ` }
    else { return (true, 'specificare un mount_in') }
    if (flagsParams.mount_out) { flags += ` -v ${flagsParams.mount_out}:/home/john/ ` }
    else { return (true, 'specificare un mount_out') }
    flagsParams = _.omit(flagsParams, 'mount_in', 'mount_out');

    // Appendo ulteriori parametri da passare al terminale del container in aggiunta allo script di default che avvia jtr
    if(cmdDocker) { cmd = cmd +" && "+ cmdDocker; }

    /******** [TO-DO] rimuovere dallo script crack.sh il comando 
     *          john --format=sha512crypt --wordlist=/in/password.lst /in/psw > /home/john/out_console.txt
     *        e costruirlo in base ai parametri passati dall'utente (magari nel chiamante)
     */
 
    // Costruisco i parametri necessari all'interfacciamento con mydockerjs
    let first = `${flags} ${image}`;
    flagsParams.cmd = cmd;
    
    // Run
    return docker.run(`${first}`, callback, flagsParams);
  },

  runJtR_withName: function (name, in_dir, out_dir, callback) {
    return this.runJtR({name:name, mount_in:in_dir, mount_out:out_dir}, callback);
  }


}