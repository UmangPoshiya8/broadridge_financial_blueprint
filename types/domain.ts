export type UserRole = 'platform_admin' | 'institution_admin' | 'investor' | 'compliance_officer';
export type VoteChoice = 'yes' | 'no' | 'abstain';
export type SettlementStatus = 'pending' | 'completed' | 'failed';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  institution_id: string | null;
}
