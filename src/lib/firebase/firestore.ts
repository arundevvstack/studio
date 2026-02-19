
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
import { Project, Invoice, TeamMember, TeamStatus, TeamRole } from '../types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const PROJECTS_COLLECTION = 'projects';
const INVOICES_COLLECTION = 'invoices';
const TEAM_COLLECTION = 'teamMembers';

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

export const deleteInvoice = (db: Firestore, id: string) => {
  const invoiceRef = doc(db, INVOICES_COLLECTION, id);
  deleteDoc(invoiceRef)
    .catch((error) => {
      const permissionError = new FirestorePermissionError({
        path: invoiceRef.path,
        operation: 'delete'
      });
      errorEmitter.emit('permission-error', permissionError);
    });
};

// Team Management
export const ensureTeamMember = async (db: Firestore, user: any) => {
  const memberRef = doc(db, TEAM_COLLECTION, user.uid);
  const snap = await getDoc(memberRef);
  
  if (!snap.exists()) {
    const memberData: TeamMember = {
      id: user.uid,
      name: user.displayName || 'New Member',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: 'Editor',
      status: 'Pending',
      createdAt: serverTimestamp()
    };
    
    setDoc(memberRef, memberData).catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: memberRef.path,
        operation: 'create',
        requestResourceData: memberData
      }));
    });
  }
};

export const updateTeamMemberStatus = (db: Firestore, userId: string, status: TeamStatus) => {
  const memberRef = doc(db, TEAM_COLLECTION, userId);
  updateDoc(memberRef, { status }).catch((error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: memberRef.path,
      operation: 'update',
      requestResourceData: { status }
    }));
  });
};

export const updateTeamMemberRole = (db: Firestore, userId: string, role: TeamRole) => {
  const memberRef = doc(db, TEAM_COLLECTION, userId);
  updateDoc(memberRef, { role }).catch((error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: memberRef.path,
      operation: 'update',
      requestResourceData: { role }
    }));
  });
};
