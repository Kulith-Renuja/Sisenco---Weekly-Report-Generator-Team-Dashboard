export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Team Member' | 'Manager';
  token: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}
