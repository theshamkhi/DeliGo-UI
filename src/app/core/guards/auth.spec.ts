import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { authGuard } from './auth';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';

describe('authGuard', () => {
  let store: MockStore;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          initialState: { auth: { isAuthenticated: false } }
        }),
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') }
        }
      ]
    });

    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
  });

  it('should allow access when authenticated', (done) => {
    store.overrideSelector(selectIsAuthenticated, true);

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      if (typeof result === 'boolean') {
        expect(result).toBe(true);
        done();
      }
    });
  });

  it('should redirect to login when not authenticated', (done) => {
    store.overrideSelector(selectIsAuthenticated, false);

    TestBed.runInInjectionContext(() => {
      authGuard({} as any, { url: '/dashboard' } as any);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/login'],
        jasmine.objectContaining({
          queryParams: { returnUrl: '/dashboard' }
        })
      );
      done();
    });
  });
});
