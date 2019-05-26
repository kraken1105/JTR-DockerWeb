export class Container {
	name:String;
	running:boolean;
    image:String;
    outConsole:String;

    constructor(name:String, running:boolean, image:String, outConsole:String) {
        this.name=name;
        this.running=running;
        this.image=image;
        this.outConsole=outConsole;
    }

}