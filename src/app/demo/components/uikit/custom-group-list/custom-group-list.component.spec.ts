import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomGroupListComponent } from './custom-group-list.component';

describe('CustomGroupListComponent', () => {
  let component: CustomGroupListComponent;
  let fixture: ComponentFixture<CustomGroupListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomGroupListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomGroupListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
