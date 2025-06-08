export interface DashboardStats {
  totalProposals: number;
  activeProjects: number;
  completedProjects: number;
  pendingProposals: number;
}

export interface FreelancerProject {
  id: string;
  title: string;
  status: 'active' | 'completed';
  company: {
    name: string;
  };
  budget: number;
  deadline: string;
}

export interface FreelancerProposal {
  id: string;
  value: number;
  status: string;
  project: {
    id: string;
    title: string;
  };
} 