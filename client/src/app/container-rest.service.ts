import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Container } from './container/container';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ContainerRestService {

  private endpoint = 'http://localhost:3000/jtr';

  constructor(private http: HttpClient) { }

  /**
   * API per accesso a livello di 'collezione'
   */ 
  getListaContainer(): Observable<Container[]> {
    return this.http.get(this.endpoint)
      .pipe( map(response => response as Container[] || [] ) );
  }

  delListaContainer() {
    return this.http.delete(this.endpoint, {responseType: 'text'});
  }

  putListaContainer() {
    return this.http.put(this.endpoint, {}, {responseType: 'text'});
  }

  /**
   * API per accesso a livello di 'elemento'
   */ 
  getContainer(name:String): Observable<Container> {
    return this.http.get(this.endpoint+name)
      .pipe( map(response => response as Container) );
  }

  delContainer(name:String) {
    return this.http.delete(this.endpoint+name, {responseType: 'text'});
  }

  putContainer(name:String) {
    return this.http.put(this.endpoint+name, {}, {responseType: 'text'});
  }

  postContainer(name:String, formData:FormData) {
    return this.http.post(this.endpoint+'/'+name, formData, {responseType: 'text'});
  }

}
