export interface Room {
  roomId: string;
  roomName: string;
  statusCode: string;
  relationshipTypeCode: string;
  ownerUserId: string;
  anniversaryDate: string | null;
  timezone: string;
  roomCreatedAt: string;
  roleCode: string;
  memberStatus: string;
  nickname: string | null;
  joinedAt: string;
}

export interface RelationshipType {
  code: string;
  name: string;
}

export interface CreateRoomPayload {
  name: string;
  relationshipTypeCode?: string;
  anniversaryDate?: string | null;
  timezone?: string;
}

export interface RoomMember {
  userLoginId: string;
  roleCode: string;
  status: string;
  nickname: string | null;
  joinedAt: string;
}

export interface InvitationResponse {
  invitationId: number;
  token: string;
}
