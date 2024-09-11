import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUploadValidatorComponent } from './user-upload-validator.component';

describe('UserUploadValidatorComponent', () => {
  let component: UserUploadValidatorComponent;
  let fixture: ComponentFixture<UserUploadValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserUploadValidatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserUploadValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
