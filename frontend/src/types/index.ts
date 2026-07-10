export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Team Member' | 'Manager';
  token: string;
}

export interface Project {
  _id: string;
  name: string;
}

export interface Report {
  _id?: string;
  user?: string | User;
  weekStartDate: string;
  weekEndDate: string;
  project: string | Project;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked: number;
  notes: string;
  status: 'Draft' | 'Submitted' | 'Late';
  submittedAt?: string;
  createdAt?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}
