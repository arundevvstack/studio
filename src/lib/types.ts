export type ProjectStage = 'Pitch' | 'Discussion' | 'Pre Production' | 'Production' | 'Post Production' | 'Released';
export type ProjectPriority = 'Low' | 'Medium' | 'High';

export interface Project {
  id: string;
  projectName: string;
  client: string;
  stage: ProjectStage;
  status: string;
  priority: ProjectPriority;
  deadline: any; // Firebase Timestamp
  progress: number;
  budget: number;
  assignedTeamMemberIds: string[]; 
  description: string;
  tags: string[];
  isRecurring: boolean;
  recurringDay?: number;
  thumbnailUrl?: string; // Strategic visual asset
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id: string;
  projectId: string;
  stage: ProjectStage;
  name: string;
  description: string;
  completed: boolean;
  priority: ProjectPriority;
  dueDate: any;
  assignedTeamMemberIds: string[];
  projectAssignedTeamMemberIds: string[]; 
  createdAt: any;
  updatedAt: any;
}

export interface InvoiceItem {
  description: string;
  amount: number;
  projectId?: string;
  isRecurringGroup?: boolean;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  clientName: string;
  status: InvoiceStatus;
  totalAmount: number;
  dueDate: any;
  items: InvoiceItem[];
  createdAt: any;
  creatorId: string;
}

export type TeamRole = 'Producer' | 'Editor' | 'Director' | 'Admin';
export type TeamStatus = 'Pending' | 'Authorized' | 'Suspended';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  role: TeamRole;
  status: TeamStatus;
  bio?: string;
  location?: string;
  portfolioUrl?: string;
  createdAt: any;
}

export interface Invitation {
  id: string;
  email: string;
  role: TeamRole;
  invitedBy: string;
  createdAt: any;
}
