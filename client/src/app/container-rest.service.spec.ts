import { TestBed } from '@angular/core/testing';

import { ContainerRestService } from './container-rest.service';

describe('ContainerRestService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ContainerRestService = TestBed.get(ContainerRestService);
    expect(service).toBeTruthy();
  });
});
