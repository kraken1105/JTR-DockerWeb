export class Container {
	Name:String;
	State:String;
    Status:String;
    outConsole:String;

    constructor(Name:String, State:String, Status:String, outConsole:String) {
        this.Name=Name;
        this.State=State;
        this.Status=Status;
        this.outConsole=outConsole;
    }

    getName() { return this.Name; }
    getState() { return this.State; }
    getStatus() { return this.Status; }
    getOutConsole() { return this.outConsole; }

}