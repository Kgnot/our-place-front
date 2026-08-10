import { HttpInterceptorFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, switchMap, throwError, filter, take, BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environments } from '../environments/environments';

// Variable para saber si ya estamos intentando refrescar el token
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);
  const http = inject(HttpClient);

  // Si no estamos en el navegador (SSR), o es una petición de auth, no hacemos nada
  if (
    !isPlatformBrowser(platformId) ||
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh')
  ) {
    return next(req);
  }

  const token = localStorage.getItem('op_token');

  // Clonamos la petición con el token actual
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // Manejamos la petición y capturamos errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el error es 401 (Token expirado o inválido)
      if (error.status === 401) {
        return handle401Error(authReq, next, http, router);
      }
      return throwError(() => error);
    }),
  );
};

function handle401Error(req: any, next: any, http: HttpClient, router: Router): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = localStorage.getItem('op_refreshToken');

    // Si no hay refresh token, mandamos al login
    if (!refreshToken) {
      isRefreshing = false;
      router.navigate(['/login']);
      return throwError(() => new Error('No refresh token available'));
    }

    // Llamamos a tu endpoint de refresh
    return http.post<any>(`${environments.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      switchMap((res) => {
        isRefreshing = false;
        const newToken = res.accessToken; // Ajusta esto si tu backend devuelve otro nombre
        localStorage.setItem('op_token', newToken);
        refreshTokenSubject.next(newToken);

        // Reintentamos la petición original con el NUEVO token
        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          }),
        );
      }),
      catchError((err) => {
        isRefreshing = false;
        // Si el refresh falla (ej: el refresh token también expiró), cerramos sesión
        localStorage.removeItem('op_token');
        localStorage.removeItem('op_refreshToken');
        router.navigate(['/login']);
        return throwError(() => err);
      }),
    );
  } else {
    // Si ya estamos refrescando el token, esperamos a que termine
    // y luego reintentamos la petición con el nuevo token
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(
          req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
          }),
        );
      }),
    );
  }
}
