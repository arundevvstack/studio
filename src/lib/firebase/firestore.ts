import { 
  collection, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  getDocs,
  Firestore,
  where
} from 'firebase/firestore';
import { Project, Invoice, TeamMember, TeamStatus, TeamRole, Invitation } from '../types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const PROJECTS_COLLECTION = 'projects';
const INVOICES_COLLECTION = 'invoices';
const TEAM_COLLECTION = 'teamMembers';
const INVITATIONS_COLLECTION = 'invitations';

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
    thumbnailUrl: data.thumbnailUrl || null,
  };

  setDoc(newProjectRef, projectData)
    .catch((error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: newProjectRef.path,
        operation: 'create',
        requestResourceData: projectData
      }));
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
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: projectRef.path,
        operation: 'update',
        requestResourceData: updateData
      }));
    });
};

export const ensureTeamMember = async (db: Firestore, user: any) => {
  const memberRef = doc(db, TEAM_COLLECTION, user.uid);
  const snap = await getDoc(memberRef);
  
  if (!snap.exists()) {
    const invQuery = query(collection(db, INVITATIONS_COLLECTION), where('email', '==', user.email));
    const invSnap = await getDocs(invQuery);
    
    let status: TeamStatus = 'Pending';
    let role: TeamRole = 'Editor';
    
    if (!invSnap.empty) {
      const invData = invSnap.docs[0].data() as Invitation;
      status = 'Authorized';
      role = invData.role;
    }

    const memberData: TeamMember = {
      id: user.uid,
      name: user.displayName || 'New Member',
      email: user.email || '',
      photoURL: user.photoURL || '',
      role: role,
      status: status,
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

export const updateTeamMemberProfile = (db: Firestore, userId: string, data: Partial<TeamMember>) => {
  const memberRef = doc(db, TEAM_COLLECTION, userId);
  return updateDoc(memberRef, data).catch((error) => {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: memberRef.path,
      operation: 'update',
      requestResourceData: data
    }));
  });
};

export const createInvitation = (db: Firestore, adminUid: string, email: string, role: TeamRole) => {
  const invRef = doc(collection(db, INVITATIONS_COLLECTION));
  const invData: Invitation = {
    id: invRef.id,
    email,
    role,
    invitedBy: adminUid,
    createdAt: serverTimestamp()
  };

  return setDoc(invRef, invData);
};
