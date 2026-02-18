import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db } from './config';
import { Project } from '../types';

const PROJECTS_COLLECTION = 'projects';

export const subscribeToProjects = (callback: (projects: Project[]) => void) => {
  const q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
    callback(projects);
  });
};

export const createProject = async (data: Partial<Project>) => {
  return await addDoc(collection(db, PROJECTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    progress: data.progress || 0,
    stage: data.stage || 'Discussion',
    priority: data.priority || 'Medium',
    status: data.status || 'Active'
  });
};

export const updateProject = async (id: string, data: Partial<Project>) => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  return await updateDoc(projectRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const getProject = async (id: string): Promise<Project | null> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  const snapshot = await getDoc(projectRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Project;
  }
  return null;
};