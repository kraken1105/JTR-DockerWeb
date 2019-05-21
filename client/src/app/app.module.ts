import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ContainerComponent } from './container/container.component';
import { ContainerListaComponent } from './container-lista/container-lista.component';
import { ContainerFormComponent } from './container-form/container-form.component';
import { ContainerFormGenericComponent } from './container-form-generic/container-form-generic.component';

@NgModule({
  declarations: [
    AppComponent,
    ContainerComponent,
    ContainerListaComponent,
    ContainerFormComponent,
    ContainerFormGenericComponent
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
      },
      {
        path: 'nuovoContainerGenerico',
        component: ContainerFormGenericComponent
      }
    ]),
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
