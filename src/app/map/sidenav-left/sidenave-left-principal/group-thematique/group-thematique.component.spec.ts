import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupThematiqueComponent } from './group-thematique.component';

describe('GroupThematiqueComponent', () => {
  let component: GroupThematiqueComponent;
  let fixture: ComponentFixture<GroupThematiqueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupThematiqueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupThematiqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
