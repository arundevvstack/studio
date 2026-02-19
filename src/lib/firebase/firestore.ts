
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
import { Project, Invoice } from '../types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const PROJECTS_COLLECTION = 'projects';
const INVOICES_COLLECTION = 'invoices';

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

export const createInvoice = (db: Firestore, userId: string, data: Partial<Invoice>) => {
  const newInvoiceRef = doc(collection(db, INVOICES_COLLECTION));
  const invoiceData = {
    ...data,
    id: newInvoiceRef.id,
    creatorId: userId,
    createdAt: serverTimestamp(),
    status: data.status || 'Draft',
  };

  setDoc(newInvoiceRef, invoiceData)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: newInvoiceRef.path,
        operation: 'create',
        requestResourceData: invoiceData
      });
      errorEmitter.emit('permission-error', permissionError);
    });

  return newInvoiceRef.id;
};

export const updateInvoice = (db: Firestore, id: string, data: Partial<Invoice>) => {
  const invoiceRef = doc(db, INVOICES_COLLECTION, id);
  updateDoc(invoiceRef, data)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: invoiceRef.path,
        operation: 'update',
        requestResourceData: data
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};
