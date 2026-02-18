import { 
  collection, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  getDoc,
  Firestore
} from 'firebase/firestore';
import { Project } from '../types';

const PROJECTS_COLLECTION = 'projects';

export const subscribeToProjects = (db: Firestore, callback: (projects: Project[]) => void) => {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
    callback(projects);
  });
};

export const createProject = async (db: Firestore, userId: string, data: Partial<Project>) => {
  const newProjectRef = doc(collection(db, PROJECTS_COLLECTION));
  const projectData = {
    ...data,
    id: newProjectRef.id,
    assignedTeamMemberIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    progress: data.progress || 0,
    stage: data.stage || 'Discussion',
    priority: data.priority || 'Medium',
    status: data.status || 'Active',
    projectName: data.projectName || 'Untitled Project',
    client: data.client || 'Internal',
    budget: Number(data.budget) || 0,
    description: data.description || '',
  };

  return await setDoc(newProjectRef, projectData);
};

export const updateProject = async (db: Firestore, id: string, data: Partial<Project>) => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  return await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const getProject = async (db: Firestore, id: string): Promise<Project | null> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  const snapshot = await getDoc(projectRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Project;
  }
  return null;
};
