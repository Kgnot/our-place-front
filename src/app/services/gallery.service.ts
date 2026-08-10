import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from '../../environments/environments';
import { Observable, from } from 'rxjs';
import { PageMedia, MediaDetail, MediaComment, UploadItem } from '../models/media.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private http = inject(HttpClient);
  private apiUrl = `${environments.apiUrl}/rooms`;

  // page/size/sort son opcionales porque los componentes los llaman de formas
  // distintas: a veces sin paginar, a veces con (page, size) sueltos.
  private toParams(
    extra: Record<string, string> = {},
    page?: number,
    size?: number,
    sort?: string[],
  ): string {
    const params = new URLSearchParams(extra);
    if (page !== undefined) params.set('page', String(page));
    if (size !== undefined) params.set('size', String(size));
    if (sort) sort.forEach((s) => params.append('sort', s));
    return params.toString();
  }

  // Subida de media
  presignUpload(roomId: string, entries: any[]) {
    return this.http.post<{ items: UploadItem[] }>(`${this.apiUrl}/${roomId}/media/presign`, {
      entries,
    });
  }

  uploadToR2(url: string, file: File): Observable<boolean> {
    return from(
      fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      }).then((res) => res.ok),
    );
  }

  confirmUpload(roomId: string, items: any[]) {
    return this.http.post<any[]>(`${this.apiUrl}/${roomId}/media/confirm`, { items });
  }

  // Obtener media
  getMediaList(roomId: string, page?: number, size?: number, sort?: string[]) {
    const params = this.toParams({}, page, size, sort);
    return this.http.get<PageMedia>(`${this.apiUrl}/${roomId}/media?${params}`);
  }

  getMediaDetail(roomId: string, mediaId: string) {
    return this.http.get<MediaDetail>(`${this.apiUrl}/${roomId}/media/${mediaId}`);
  }

  deleteMedia(roomId: string, mediaId: string) {
    return this.http.delete(`${this.apiUrl}/${roomId}/media/${mediaId}`);
  }

  updateCaption(roomId: string, mediaId: string, caption: string) {
    return this.http.patch(`${this.apiUrl}/${roomId}/media/${mediaId}/caption`, { caption });
  }

  // Consultas especializadas
  getMediaForMonth(
    roomId: string,
    year: number,
    month: number,
    page?: number,
    size?: number,
    sort?: string[],
  ) {
    const params = this.toParams({ year: String(year), month: String(month) }, page, size, sort);
    return this.http.get<PageMedia>(`${this.apiUrl}/${roomId}/media/this-month?${params}`);
  }

  getMediaForWeek(
    roomId: string,
    referenceDate: string,
    page?: number,
    size?: number,
    sort?: string[],
  ) {
    const params = this.toParams({ referenceDate }, page, size, sort);
    return this.http.get<PageMedia>(`${this.apiUrl}/${roomId}/media/this-week?${params}`);
  }

  getLatestMedia(roomId: string, page?: number, size?: number, sort?: string[]) {
    const params = this.toParams({}, page, size, sort);
    return this.http.get<PageMedia>(`${this.apiUrl}/${roomId}/media/latest?${params}`);
  }

  getMediaByDateRange(
    roomId: string,
    from: string,
    to: string,
    page?: number,
    size?: number,
    sort?: string[],
  ) {
    const params = this.toParams({ from, to }, page, size, sort);
    return this.http.get<PageMedia>(`${this.apiUrl}/${roomId}/media/by-date?${params}`);
  }

  // Comentarios
  listComments(roomId: string, mediaId: string) {
    return this.http.get<MediaComment[]>(`${this.apiUrl}/${roomId}/media/${mediaId}/comments`);
  }

  addComment(roomId: string, mediaId: string, content: string) {
    return this.http.post(`${this.apiUrl}/${roomId}/media/${mediaId}/comments`, { content });
  }

  deleteComment(roomId: string, mediaId: string, commentId: string) {
    return this.http.delete(`${this.apiUrl}/${roomId}/media/${mediaId}/comments/${commentId}`);
  }

  // Reacciones
  react(roomId: string, mediaId: string, reactionType: string) {
    return this.http.put(`${this.apiUrl}/${roomId}/media/${mediaId}/reactions/me`, {
      reactionType,
    });
  }

  removeReaction(roomId: string, mediaId: string) {
    return this.http.delete(`${this.apiUrl}/${roomId}/media/${mediaId}/reactions/me`);
  }
}
