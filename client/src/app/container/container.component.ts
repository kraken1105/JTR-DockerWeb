import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { interval } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Container } from './container';
import { ContainerRestService } from '../container-rest.service';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css'],
  providers: [ContainerRestService]
})
export class ContainerComponent implements OnInit {

  @Input() container: Container;
  @Output() updateListNow = new EventEmitter<{}>();
  isExited: boolean = true;
  pollingRef;

  /**
   * Costruttore, inietto il servizio che fornisce le API REST
   */
  constructor(private containerRestService: ContainerRestService) { }

  /**
   * Richiamata alla Init del componente, avvia il polling
   * se il container è ancora in esecuzione.
   */
  ngOnInit() {
    if(this.container.running) {
      this.pollingContainer();
      this.isExited = false;
    }
  }

  /**
   * Richiamata alla Destroy del componente, ferma il polling se ancora attivo.
   */
  ngOnDestroy() {
    if(this.pollingRef)
      this.pollingRef.unsubscribe();
  }

  /**
   * Avvia un polling con GET/:name (ogni 2 secondi).
   */
  pollingContainer() {
    this.pollingRef = interval(2000).pipe(
      flatMap( () => this.containerRestService.getContainer(this.container.name) )
    ).subscribe(result => 
      {        
        if(!this.container.running) {
          this.isExited = true;
          this.pollingRef.unsubscribe();
        } else 
          this.container = result;
      }
    );
  }

  delContainer() {
    this.containerRestService.delContainer(this.container.name)
      .subscribe(result => 
        {
          console.log("DEL "+this.container.name+" "+result);
          this.updateListNow.emit(); // segnala al container-lista-component di aggiornare la lista di container
        });
  }

  putContainer() {
    this.containerRestService.putContainer(this.container.name)
      .subscribe(result => console.log("PUT "+this.container.name+" "+result));
  }

}
