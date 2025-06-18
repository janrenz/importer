export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'teacher';
  schildId: string;
  klasse?: string;
}

export interface KeycloakConfig {
  url: string;
  realm: string;
  clientId: string;
  username: string;
  password: string;
}

export interface SyncableAttribute {
  key: keyof User;
  label: string;
  required: boolean;
}