import {Component, OnInit}  from '@angular/core';

@Component({
    selector:'app-servers',
    templateUrl: './servers.component.html',
    styleUrls:['./servers.component.css']
})

export class ServersComponent implements OnInit{
    
    allowNewServer = false;
    serverCreated: boolean = false; 
    serverCreationStatus = 'No Server was created';
    serverName = 'TestingServer';
    servers = ['TestServer 1 ' , 'TestServer 2'];

    constructor(){
        setTimeout(()=>{
            this.allowNewServer = true;
        },2000);
    }
    ngOnInit() {
        
    }

    onCreateServer(){
        this.serverCreationStatus="Server was created! " + this.serverName;
        this.servers.push(this.serverName);
        setTimeout(()=>{
            this.serverCreated = true;
        },2000);
    }

    onUpdateServerName(event : Event){
        this.serverName = (<HTMLInputElement>event.target).value;
        console.log(event);
    }
}