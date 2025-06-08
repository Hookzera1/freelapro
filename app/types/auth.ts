import { User as FirebaseUser } from 'firebase/auth';

export interface CustomUser extends FirebaseUser {
  userType?: 'freelancer' | 'company';
}

export type User = CustomUser; 