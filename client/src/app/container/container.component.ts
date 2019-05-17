import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Container } from './container';
import { ContainerRestService } from '../container-rest.service';
import { interval, observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';

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
  observableRef;

  /**
   * Costruttore, inietto il servizio che fornisce le API REST
   */
  constructor(private containerRestService: ContainerRestService) { }

  /**
   * Richiamata alla Init del componente, avvia il polling
   * se il container è ancora in esecuzione.
   */
  ngOnInit() {
    if(!(this.container.State == 'exited')) {
      this.pollingContainer();
      this.isExited = false;
    }
  }

  /**
   * Richiamata alla Destroy del componente, ferma il polling se ancora attivo.
   */
  ngOnDestroy() {
    if(this.observableRef)
      this.observableRef.unsubscribe();
  }

  /**
   * Avvia un polling con GET/:name (ogni 2 secondi).
   */
  pollingContainer() {
    this.observableRef = interval(2000).pipe(
      flatMap( () => this.containerRestService.getContainer(this.container.Name) )
    ).subscribe(result => {        
        if(this.container.State == 'exited') {
          this.isExited = true;
          this.observableRef.unsubscribe();
        } else this.container = result;
      }
    );
  }

  delContainer() {
    this.containerRestService.delContainer(this.container.Name)
      .subscribe(result => {console.log("DEL "+this.container.Name+" "+result); this.updateListNow.emit();});
  }

  putContainer() {
    this.containerRestService.putContainer(this.container.Name)
      .subscribe(result => {console.log("PUT "+this.container.Name+" "+result); this.updateListNow.emit();});
  }  

}
