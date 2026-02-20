import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { LoginComponent } from './login';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let store: MockStore;

  const initialState = {
    auth: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideMockStore({ initialState }),
        provideRouter([]),
        provideAnimations()
      ]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should validate required fields', () => {
    const username = component.loginForm.get('username');
    const password = component.loginForm.get('password');

    expect(username?.hasError('required')).toBeTruthy();
    expect(password?.hasError('required')).toBeTruthy();
  });

  it('should be valid with username and password', () => {
    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });

    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should dispatch login action on submit', () => {
    const dispatchSpy = spyOn(store, 'dispatch');

    component.loginForm.setValue({
      username: 'testuser',
      password: 'password123'
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalled();
  });
});
