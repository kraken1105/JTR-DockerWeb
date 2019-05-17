import { Component, OnInit } from '@angular/core';
import { Container } from '../container/container';
import { ContainerRestService } from '../container-rest.service';

@Component({
  selector: 'app-container-lista',
  templateUrl: './container-lista.component.html',
  styleUrls: ['./container-lista.component.css'],
  providers: [ContainerRestService]
})
export class ContainerListaComponent implements OnInit {

  listaContainer: Container[];
  
  /**
   * Costruttore, inietto il servizio che fornisce le API REST
   */
  constructor(private containerRestService: ContainerRestService) { }

  /**
   * Richiamata alla Init del componente, aggiorna tutti i componenti.
   */
  ngOnInit() {
    this.getListaContainer();
  }

  getListaContainer() {
    this.containerRestService.getListaContainer()
      .subscribe(result => {console.log("GET "+result); this.listaContainer = result});
  }

  delListaContainer() {
    this.containerRestService.delListaContainer()
      .subscribe(result => {console.log("DEL "+result); this.getListaContainer();});
  }

  putListaContainer() {
    this.containerRestService.putListaContainer()
      .subscribe(result => console.log("PUT "+result));
  }

}
