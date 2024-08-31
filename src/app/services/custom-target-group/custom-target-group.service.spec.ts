import { TestBed } from '@angular/core/testing';

import { CustomTargetGroupService } from './custom-target-group.service';

describe('CustomTargetGroupService', () => {
  let service: CustomTargetGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomTargetGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
