import { Page } from './shared.model';

export interface MediaSummary {
  id: string;
  thumbnailUrl: string;
  mediaTypeCode: string;
  takenAt: string;
}

export type PageMedia = Page<MediaSummary>;

export interface MediaDetail {
  id: string;
  r2Url: string;
  thumbnailUrl: string;
  mediaTypeCode: string;
  caption?: string;
  takenAt: string;
  uploadedByUserId: string;
  commentCount: number;
  reactionCount: number;
  currentUserReactionType?: string;
}

export interface MediaComment {
  id: string;
  userLoginId: string;
  content: string;
  createdAt: string;
}

export interface UploadItem {
  mediaId: string;
  uploadUrl: string;
  r2Key: string;
}
