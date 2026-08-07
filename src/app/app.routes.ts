import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { RoomFeedComponent } from './pages/room-feed/room-feed.component';
import { RoomCalendarComponent } from './pages/room-calendar/room-calendar.component';
import { RoomMapComponent } from './pages/room-map/room-map.component';

const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    return true;
  }
  router.navigate(['/login']).then(r => console.info('navegando a login', r));
  return false;
};

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'rooms', component: RoomsComponent, canActivate: [authGuard] },
  { path: 'rooms/:roomId', component: RoomFeedComponent, canActivate: [authGuard] },
  { path: 'rooms/:roomId/dates', component: RoomFeedComponent, canActivate: [authGuard] }, // Temporal
  { path: 'rooms/:roomId/calendar', component: RoomCalendarComponent, canActivate: [authGuard] }, // Temporal
  { path: 'rooms/:roomId/map', component: RoomMapComponent, canActivate: [authGuard] }, // Temporal
];
