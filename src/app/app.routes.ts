import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth';
import { guestGuard } from './core/guards/guest';
import { roleGuard } from './core/guards/role';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Connexion - DeliGo'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then(m => m.RegisterComponent),
    canActivate: [roleGuard(['ROLE_MANAGER'])],
    title: 'Inscription - DeliGo'
  },

  {
    path: 'oauth2/redirect',
    loadComponent: () => import('./features/auth/oauth2-redirect/oauth2-redirect').then(m => m.OAuth2RedirectComponent),
    title: 'Connexion OAuth2 - DeliGo'
  },

  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
        title: 'Dashboard - DeliGo'
      },
      // CLIENTS - Manager ONLY (full CRUD)
      {
        path: 'clients',
        canActivate: [roleGuard(['ROLE_MANAGER'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/clients/client-list/client-list').then(m => m.ClientListComponent),
            title: 'Clients - DeliGo'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/clients/client-form/client-form').then(m => m.ClientFormComponent),
            title: 'Nouveau Client - DeliGo'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/clients/client-detail/client-detail').then(m => m.ClientDetailComponent),
            title: 'Détail Client - DeliGo'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/clients/client-form/client-form').then(m => m.ClientFormComponent),
            title: 'Modifier Client - DeliGo'
          }
        ]
      },
      // DESTINATAIRES - All roles but different permissions
      // Manager: Full CRUD on all
      // Client: Create + View own
      {
        path: 'destinataires',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/destinataires/destinataire-list/destinataire-list').then(m => m.DestinataireListComponent),
            title: 'Destinataires - DeliGo'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/destinataires/destinataire-form/destinataire-form').then(m => m.DestinataireFormComponent),
            title: 'Nouveau Destinataire - DeliGo'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/destinataires/destinataire-detail/destinataire-detail').then(m => m.DestinataireDetailComponent),
            title: 'Détail Destinataire - DeliGo'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/destinataires/destinataire-form/destinataire-form').then(m => m.DestinataireFormComponent),
            canActivate: [roleGuard(['ROLE_MANAGER'])],
            title: 'Modifier Destinataire - DeliGo'
          }
        ]
      },
      // LIVREURS - Manager ONLY
      {
        path: 'livreurs',
        canActivate: [roleGuard(['ROLE_MANAGER'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/livreurs/livreur-list/livreur-list').then(m => m.LivreurListComponent),
            title: 'Livreurs - DeliGo'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/livreurs/livreur-form/livreur-form').then(m => m.LivreurFormComponent),
            title: 'Nouveau Livreur - DeliGo'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/livreurs/livreur-detail/livreur-detail').then(m => m.LivreurDetailComponent),
            title: 'Détail Livreur - DeliGo'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/livreurs/livreur-form/livreur-form').then(m => m.LivreurFormComponent),
            title: 'Modifier Livreur - DeliGo'
          }
        ]
      },
      // PRODUITS - All can view, Manager can create/edit
      {
        path: 'produits',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/produits/produit-list/produit-list').then(m => m.ProduitListComponent),
            title: 'Produits - DeliGo'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/produits/produit-form/produit-form').then(m => m.ProduitFormComponent),
            canActivate: [roleGuard(['ROLE_MANAGER'])],
            title: 'Nouveau Produit - DeliGo'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/produits/produit-detail/produit-detail').then(m => m.ProduitDetailComponent),
            title: 'Détail Produit - DeliGo'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/produits/produit-form/produit-form').then(m => m.ProduitFormComponent),
            canActivate: [roleGuard(['ROLE_MANAGER'])],
            title: 'Modifier Produit - DeliGo'
          }
        ]
      },
      // ZONES - Manager ONLY
      {
        path: 'zones',
        canActivate: [roleGuard(['ROLE_MANAGER'])],
        children: [
          {
            path: '',
            loadComponent: () => import('./features/zones/zone-list/zone-list').then(m => m.ZoneListComponent),
            title: 'Zones - DeliGo'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/zones/zone-form/zone-form').then(m => m.ZoneFormComponent),
            title: 'Nouvelle Zone - DeliGo'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/zones/zone-detail/zone-detail').then(m => m.ZoneDetailComponent),
            title: 'Détail Zone - DeliGo'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/zones/zone-form/zone-form').then(m => m.ZoneFormComponent),
            title: 'Modifier Zone - DeliGo'
          }
        ]
      },
      // COLIS - All roles but filtered data
      // Manager: All colis
      // Livreur: Assigned colis only
      // Client: Own colis only
      {
        path: 'colis',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/colis/colis-list/colis-list').then(m => m.ColisListComponent),
            title: 'Colis - DeliGo'
          },
          {
            path: 'new',
            loadComponent: () => import('./features/colis/colis-form/colis-form').then(m => m.ColisFormComponent),
            canActivate: [roleGuard(['ROLE_MANAGER', 'ROLE_CLIENT'])],
            title: 'Nouveau Colis - DeliGo'
          },
          {
            path: 'tracking',
            loadComponent: () => import('./features/colis/colis-tracking/colis-tracking').then(m => m.ColisTrackingComponent),
            title: 'Suivi Colis - DeliGo'
          },
          {
            path: ':id',
            loadComponent: () => import('./features/colis/colis-detail/colis-detail').then(m => m.ColisDetailComponent),
            title: 'Détail Colis - DeliGo'
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./features/colis/colis-form/colis-form').then(m => m.ColisFormComponent),
            canActivate: [roleGuard(['ROLE_MANAGER', "ROLE_LIVREUR"])],
            title: 'Modifier Colis - DeliGo'
          }
        ]
      }
    ]
  },

  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
