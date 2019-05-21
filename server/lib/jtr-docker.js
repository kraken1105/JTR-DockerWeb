
const _ = require('underscore');
const docker = require ('mydockerjs').docker;

module.exports = {
  docker,

  myRun: function (image, flagsParams, callback, cmdContainer) {
    /* Parametri gestiti:
     *    remove: --rm 
     *    mount_sys , mount_cont: rispettivamente percorso di mount del server e mappatura nel container
     */
    
    let myFlags = '';
    if (params.remove)
      { myFlags += ' --rm '; }
    if (flagsParams.mount_sys && lagsParams.mount_cont)
      { myFlags += ` -v ${flagsParams.mount_sys}:${flagsParams.mount_cont} ` }
    
    flagsParams = _.omit(flagsParams, 'remove', 'mount_sys', 'mount_cont');

    // Costruisco i parametri necessari all'interfacciamento con mydockerjs
    let first = `${myFlags} ${image}`;
    flagsParams.cmd = cmdContainer;
    
    // Run
    return docker.run(`${first}`, callback, flagsParams);
  },

  /** - viene utilizzata di default la docker image 'knsit/johntheripper'
  * - nei paramsInput è possibile specificare i mount point di input e output dell'host,
  *   mappati rispettivamente in /in e /home/john/ del container.
  */
  runJtR: function (flagsDocker, callback) {
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
 
    // Costruisco i parametri necessari all'interfacciamento con mydockerjs
    let first = `${flags} ${image}`;
    flagsParams.cmd = cmd;
    
    // Run
    return docker.run(`${first}`, callback, flagsParams);
  }/* ,

  runJtR_withName: function (name, in_dir, out_dir, callback) {
    return this.runJtR({name:name, mount_in:in_dir, mount_out:out_dir}, callback);
  } */


}