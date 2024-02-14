import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabCompComponent } from './tab-comp.component';

describe('TabCompComponent', () => {
  let component: TabCompComponent;
  let fixture: ComponentFixture<TabCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TabCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TabCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
