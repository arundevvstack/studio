export type ProjectStage = 'Discussion' | 'Pre Production' | 'Production' | 'Post Production' | 'Released';
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
  assignedTeam: string[];
  description: string;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  description: string;
  completed: boolean;
  dueDate: any;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  content: string;
  author: string;
  createdAt: any;
}