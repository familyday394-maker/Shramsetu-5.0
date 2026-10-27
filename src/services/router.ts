/**
 * Shram Setu 2.0 - Client-Side Route Controller
 * Provides reliable, standard URL hash routing compatible with browser back/forward,
 * direct bookmark links, and refresh without server-side route rewrite dependencies.
 */

export type AppRoute =
  | 'home'
  | 'how-it-works'
  | 'create-account'
  | 'sign-in'
  | 'forgot-password'
  | 'privacy'
  | 'help'
  | 'about'
  | 'verify'
  | 'worker'
  | 'contractor'
  | 'judge-demo';

export interface RouteState {
  route: AppRoute;
  params: Record<string, string>;
}

class Router {
  private listeners: ((state: RouteState) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this.handleLocationChange());
      window.addEventListener('popstate', () => this.handleLocationChange());
    }
  }

  public getCurrentRoute(): RouteState {
    if (typeof window === 'undefined') {
      return { route: 'home', params: {} };
    }

    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    const [pathPart, queryPart] = hash.split('?');
    const path = pathPart.toLowerCase();

    const params: Record<string, string> = {};
    if (queryPart) {
      const searchParams = new URLSearchParams(queryPart);
      searchParams.forEach((val, key) => {
        params[key] = val;
      });
    }

    switch (path) {
      case 'how-it-works':
        return { route: 'how-it-works', params };
      case 'create-account':
      case 'register':
      case 'signup':
        return { route: 'create-account', params };
      case 'sign-in':
      case 'login':
        return { route: 'sign-in', params };
      case 'forgot-password':
      case 'recover-password':
      case 'password-recovery':
        return { route: 'forgot-password', params };
      case 'privacy':
      case 'privacy-policy':
      case 'data-use':
        return { route: 'privacy', params };
      case 'help':
      case 'contact':
      case 'support':
        return { route: 'help', params };
      case 'about':
      case 'about-project':
      case 'bal-vigyan':
        return { route: 'about', params };
      case 'verify':
      case 'verify-pass':
      case 'pass':
        return { route: 'verify', params };
      case 'worker':
      case 'worker-portal':
        return { route: 'worker', params };
      case 'contractor':
      case 'contractor-portal':
        return { route: 'contractor', params };
      case 'judge-demo':
      case 'demo':
      case 'audit-tour':
        return { route: 'judge-demo', params };
      case 'home':
      case '':
      default:
        return { route: 'home', params };
    }
  }

  public navigate(route: AppRoute, params?: Record<string, string>): void {
    if (typeof window === 'undefined') return;

    let targetHash = `#/${route}`;
    if (params && Object.keys(params).length > 0) {
      const sp = new URLSearchParams(params);
      targetHash += `?${sp.toString()}`;
    }

    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      this.handleLocationChange();
    }
  }

  public subscribe(cb: (state: RouteState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private handleLocationChange(): void {
    const state = this.getCurrentRoute();
    this.listeners.forEach((cb) => cb(state));
  }
}

export const router = new Router();
