import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { TripDetailComponent } from './pages/trip-detail/trip-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'trip/:id', component: TripDetailComponent },
  { path: '**', redirectTo: '' },
];
