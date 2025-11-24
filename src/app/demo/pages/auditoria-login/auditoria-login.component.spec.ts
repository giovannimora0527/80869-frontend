import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaLoginComponent } from './auditoria-login.component';

describe('AuditoriaLoginComponent', () => {
  let component: AuditoriaLoginComponent;
  let fixture: ComponentFixture<AuditoriaLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditoriaLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriaLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
