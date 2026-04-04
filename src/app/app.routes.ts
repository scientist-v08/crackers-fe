import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Route,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

const canActivateAdmin: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  if (localStorage.getItem('admin') === 'true') {
    return true;
  }
  return router.createUrlTree(['']);
};

const canActivateUserOrAdmin: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  if (localStorage.getItem('user') === 'true') {
    return true;
  }
  if (localStorage.getItem('admin') === 'true') {
    return true;
  }
  return router.createUrlTree(['']);
};

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component'),
  },
  {
    path: 'billing',
    loadComponent: () => import('./pages/billing/billing.component'),
    canActivate: [canActivateUserOrAdmin],
  },
  {
    path: 'expenses',
    loadComponent: () => import('./pages/expenses/expenses.component'),
    canActivate: [canActivateAdmin],
  },
  {
    path: 'inventory',
    loadComponent: () => import('./pages/inventory/inventory.component'),
    canActivate: [canActivateAdmin],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component'),
  },
];
