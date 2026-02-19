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
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  completed: boolean;
  priority: ProjectPriority;
  dueDate: any;
  projectAssignedTeamMemberIds: string[]; 
  createdAt: any;
  updatedAt: any;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  content: string;
  authorId: string;
  projectAssignedTeamMemberIds: string[]; 
  createdAt: any;
}
