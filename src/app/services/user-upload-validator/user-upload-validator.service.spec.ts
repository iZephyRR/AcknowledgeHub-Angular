import { TestBed } from '@angular/core/testing';

import { UserUploadValidatorService } from './user-upload-validator.service';

describe('UserUploadValidatorService', () => {
  let service: UserUploadValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserUploadValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
