import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EachAnnoNotedListComponent } from './each-anno-noted-list.component';

describe('EachAnnoNotedListComponent', () => {
  let component: EachAnnoNotedListComponent;
  let fixture: ComponentFixture<EachAnnoNotedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EachAnnoNotedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EachAnnoNotedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
