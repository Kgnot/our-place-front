import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { Observable, from, forkJoin, switchMap, map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;

  // Paso 1: Pedir URLs prefirmadas
  presignUpload(roomId: string, entries: any[]) {
    return this.http.post<{ items: { mediaId: string; uploadUrl: string; r2Key: string }[] }>(
      `${this.apiUrl}/${roomId}/media/presign`,
      { entries },
    );
  }

  // Paso 2: Subir directo a R2 (PUT)
  // uploadToR2(uploadUrl: string, file: File): Observable<boolean> {
  //   return this.http
  //     .put(uploadUrl, file, {
  //       headers: { 'Content-Type': file.type },
  //       observe: 'response',
  //       reportProgress: true, // Opcional, si quieres mostrar progreso
  //     })
  //     .pipe(
  //       map((res) => res.ok),
  //       catchError(() => of(false)),
  //     );
  // }
  uploadToR2(url: string, file: File): Observable<boolean> {
    return from(
      fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      }).then((res) => res.ok),
    );
  }

  // Paso 3: Confirmar en tu backend
  confirmUpload(roomId: string, items: any[]) {
    return this.http.post<any[]>(`${this.apiUrl}/${roomId}/media/confirm`, { items });
  }

  // Paso 4: Polling para obtener thumbnails
  getMediaList(roomId: string, page: number = 0, size: number = 50) {
    return this.http.get<any>(`${this.apiUrl}/${roomId}/media?page=${page}&size=${size}`);
  }
}
