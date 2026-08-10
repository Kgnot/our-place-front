export interface Pet {
  id: string;
  roomId: string;
  speciesCode: string;
  speciesName: string;
  name: string;
  breed?: string;
  birthDate?: string;
  avatarUrl?: string;
  createdByUserId: string;
  createdAt: string;
}

export interface CreatePetPayload {
  speciesCode: string;
  name: string;
  breed?: string;
  birthDate?: string;
  avatarUrl?: string;
}

export interface UpdatePetPayload extends CreatePetPayload {}

export interface LkpSpecies {
  code: string;
  name: string;
}
