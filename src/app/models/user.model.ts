export interface User {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  timezone: string | null;
  locale: string | null;
  statusCode: string;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para lo que enviamos al actualizar (todos opcionales menos los que tú decidas)
export interface UpdateUserPayload {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  birthDate?: string | null;
  timezone?: string | null;
  locale?: string | null;
}
