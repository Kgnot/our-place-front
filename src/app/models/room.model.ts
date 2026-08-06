export interface Room {
  roomId: string;
  roomName: string;
  statusCode: string;
  relationshipTypeCode: 'family' | 'couple' | 'friends' | string; // TODO, esto en teoría viene de un api
  ownerUserId: string;
  anniversaryDate: string | null;
  timezone: string;
  roomCreatedAt: string;
  roleCode: string;
  memberStatus: string;
  nickname: string | null;
  joinedAt: string;
}
