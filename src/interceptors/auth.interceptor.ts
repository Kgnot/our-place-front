import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // Solo añadimos el token si estamos en el navegador (no en SSR)
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('op_token');

    if (token) {
      // Clonamos la petición y añadimos el header de Authorization
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(authReq);
    }
  }
  // Si no hay token, dejamos pasar la petición normal
  return next(req);
};
