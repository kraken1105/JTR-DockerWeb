import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerListaComponent } from './container-lista.component';

describe('ContainerListaComponent', () => {
  let component: ContainerListaComponent;
  let fixture: ComponentFixture<ContainerListaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerListaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
