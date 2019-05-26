import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ContainerFormComponent } from './container-form/container-form.component';
import { ContainerListaComponent } from './container-lista/container-lista.component';
import { ContainerComponent } from './container/container.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerListaComponent,
    ContainerFormComponent,
    ContainerComponent
  ],
  imports: [
    RouterModule.forRoot([
      {
        path: '',
        component: ContainerListaComponent
      },
      {
        path: 'nuovoContainer',
        component: ContainerFormComponent
      }
    ]),
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
