import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContainerFormGenericComponent } from './container-form-generic.component';

describe('ContainerFormGenericComponent', () => {
  let component: ContainerFormGenericComponent;
  let fixture: ComponentFixture<ContainerFormGenericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContainerFormGenericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContainerFormGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
