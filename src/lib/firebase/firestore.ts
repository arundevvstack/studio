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
 * Initiates the creation of a new project.
 * Uses a non-blocking pattern where the write is initiated and errors are handled asynchronously.
 * @returns the ID of the new project document.
 */
export const createProject = (db: Firestore, userId: string, data: Partial<Project>) => {
  const newProjectRef = doc(collection(db, PROJECTS_COLLECTION));
  const projectData = {
    ...data,
    id: newProjectRef.id,
    assignedTeamMemberIds: [userId],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    progress: data.progress || 0,
    stage: data.stage || 'Pitch',
    priority: data.priority || 'Medium',
    status: data.status || 'Active',
    projectName: data.projectName || 'Untitled Project',
    client: data.client || 'Internal',
    budget: Number(data.budget) || 0,
    description: data.description || '',
    isRecurring: data.isRecurring || false,
    recurringDay: data.recurringDay || null,
  };

  // Initiate write operation without awaiting
  setDoc(newProjectRef, projectData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: newProjectRef.path,
        operation: 'create',
        requestResourceData: projectData
      });
      errorEmitter.emit('permission-error', permissionError);
    });

  return newProjectRef.id;
};

/**
 * Initiates an update to an existing project.
 * Uses a non-blocking pattern.
 */
export const updateProject = (db: Firestore, id: string, data: Partial<Project>) => {
  const projectRef = doc(db, PROJECTS_COLLECTION, id);
  const updateData = {
    ...data,
    updatedAt: serverTimestamp()
  };
  
  updateDoc(projectRef, updateData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: projectRef.path,
        operation: 'update',
        requestResourceData: updateData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

/**
 * Retrieves a single project document.
 */
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
