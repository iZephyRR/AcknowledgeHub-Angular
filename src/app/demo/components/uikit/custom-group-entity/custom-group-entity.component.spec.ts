import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomGroupEntityComponent } from './custom-group-entity.component';

describe('CustomGroupEntityComponent', () => {
  let component: CustomGroupEntityComponent;
  let fixture: ComponentFixture<CustomGroupEntityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomGroupEntityComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomGroupEntityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
