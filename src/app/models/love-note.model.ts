export interface LoveNote {
  id: string;
  roomId: string;
  authorUserId: string;
  typeName: string; // nuevo
  typeCode: string;
  content: string;
  createdAt: string;
}

export interface CreateLoveNotePayload {
  typeCode: string;
  content: string;
}
