import { TestBed } from '@angular/core/testing';

import { MaptotreeService } from './maptotree.service';

describe('MaptotreeService', () => {
  let service: MaptotreeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaptotreeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
