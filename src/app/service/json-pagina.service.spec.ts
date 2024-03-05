import { TestBed } from '@angular/core/testing';

import { JsonPaginaService } from './json-pagina.service';

describe('JsonPaginaService', () => {
  let service: JsonPaginaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonPaginaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
