import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVectorProviderComponent } from './edit-vector-provider.component';

describe('EditVectorProviderComponent', () => {
  let component: EditVectorProviderComponent;
  let fixture: ComponentFixture<EditVectorProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditVectorProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVectorProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
