
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
  Firestore,
  where
} from 'firebase/firestore';
import { Project } from '../types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const PROJECTS_COLLECTION = 'projects';

/**
 * Standard subscription for projects. 
 * Note: Use useCollection hook in components for better error handling.
 */
export const subscribeToProjects = (db: Firestore, userId: string, isAdmin: boolean, callback: (projects: Project[]) => void) => {
  let q = query(collection(db, PROJECTS_COLLECTION), orderBy('createdAt', 'desc'));
  
  if (!isAdmin) {
    q = query(
      collection(db, PROJECTS_COLLECTION), 
      where('assignedTeamMemberIds', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );
  }

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];
    callback(projects);
  }, (error) => {
    const permissionError = new FirestorePermissionError({
      path: PROJECTS_COLLECTION,
      operation: 'list'
    });
    errorEmitter.emit('permission-error', permissionError);
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

  return setDoc(newProjectRef, projectData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: newProjectRef.path,
        operation: 'create',
        requestResourceData: projectData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

export const updateProject = async (db: Firestore, id: string, data: Partial<Project>) => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  return updateDoc(projectRef, updateData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: projectRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

export const getProject = async (db: Firestore, id: string): Promise<Project | null> => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  try {
    const snapshot = await getDoc(projectRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Project;
    }
  } catch (error) {
    const permissionError = new FirestorePermissionError({
      path: projectRef.path,
      operation: 'get'
    });
    errorEmitter.emit('permission-error', permissionError);
  }
  return null;
};
