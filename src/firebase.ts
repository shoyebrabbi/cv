import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  linkWithCredential,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  Firestore,
  doc,
  getDocFromServer,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  CVData,
  CVProfile,
  CustomTemplatePreset,
  JobApplication,
  StudioSettings,
} from './types/cv';

export const OWNER_ADMIN_EMAIL = 'md.shoyeb.rabbi@gmail.com';
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

const app = initializeApp(firebaseConfig);

function createFirestoreDb(): Firestore {
  const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        ignoreUndefinedProperties: true,
      },
      databaseId
    );
  } catch {
    return getFirestore(app, databaseId);
  }
}

export const db: Firestore = createFirestoreDb();
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
void testConnection();

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();
}

export function isAuthorizedOwner(user: User | null | undefined): boolean {
  if (!user || !user.email || !user.emailVerified) return false;
  return isOwnerEmail(user.email);
}

export function subscribeAuth(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}

export async function signInOwnerWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  if (!isOwnerEmail(result.user.email)) {
    await signOut(auth);
    throw Object.assign(new Error('Unauthorized owner email'), { code: 'auth/unauthorized-owner-email' });
  }
  return result.user;
}

export async function signInOwnerWithEmailPassword(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isOwnerEmail(normalizedEmail)) {
    throw Object.assign(new Error('Unauthorized owner email'), { code: 'auth/unauthorized-owner-email' });
  }
  const result = await signInWithEmailAndPassword(auth, OWNER_ADMIN_EMAIL, password);
  if (!isOwnerEmail(result.user.email)) {
    await signOut(auth);
    throw Object.assign(new Error('Unauthorized owner email'), { code: 'auth/unauthorized-owner-email' });
  }
  return result.user;
}

export async function registerOwnerWithEmailPassword(email: string, password: string): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isOwnerEmail(normalizedEmail)) {
    throw Object.assign(new Error('Unauthorized owner email'), { code: 'auth/unauthorized-owner-email' });
  }
  const result = await createUserWithEmailAndPassword(auth, OWNER_ADMIN_EMAIL, password);
  await sendEmailVerification(result.user);
  return result.user;
}

export async function resendOwnerVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user || !isOwnerEmail(user.email)) {
    throw Object.assign(new Error('Unauthorized owner email'), { code: 'auth/unauthorized-owner-email' });
  }
  await sendEmailVerification(user);
}

export async function refreshOwnerVerificationStatus(): Promise<User | null> {
  const user = auth.currentUser;
  if (!user) return null;
  await user.reload();
  await user.getIdToken(true);
  return auth.currentUser;
}

export async function sendOwnerPasswordReset(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isOwnerEmail(normalizedEmail)) {
    throw Object.assign(new Error('Unauthorized owner email'), { code: 'auth/unauthorized-owner-email' });
  }
  await sendPasswordResetEmail(auth, OWNER_ADMIN_EMAIL);
}

export async function changeOwnerPassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email || !isAuthorizedOwner(user)) {
    throw Object.assign(new Error('Not authorized'), { code: 'auth/unauthorized-owner-email' });
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

export async function linkOwnerPassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email || !isAuthorizedOwner(user)) {
    throw Object.assign(new Error('Not authorized'), { code: 'auth/unauthorized-owner-email' });
  }
  const credential = EmailAuthProvider.credential(user.email, newPassword);
  await linkWithCredential(user, credential);
}

export async function signOutOwner(): Promise<void> {
  await signOut(auth);
}

export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        out[key] = stripUndefinedDeep(val);
      }
    }
    return out as T;
  }
  return value;
}

function sanitizeId(raw: string, fallbackPrefix = 'id'): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return cleaned.length > 0 ? cleaned : `${fallbackPrefix}_${Date.now()}`;
}

function clipText(val: unknown, max: number, fallback = ''): string {
  const s = typeof val === 'string' ? val : fallback;
  return s.slice(0, max);
}

export interface CloudPublicSiteDoc {
  activeProfileId: string;
  activeData: CVData;
  activeSettings: StudioSettings;
  ownerUid: string;
}

export function subscribePublicSite(
  onData: (site: CloudPublicSiteDoc | null) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'public_site/main';
  return onSnapshot(
    doc(db, 'public_site', 'main'),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      const d = snap.data();
      onData({
        activeProfileId: String(d.activeProfileId || 'prof_master'),
        activeData: d.activeData as CVData,
        activeSettings: d.activeSettings as StudioSettings,
        ownerUid: String(d.ownerUid || ''),
      });
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribePublicProfiles(
  onData: (profiles: CVProfile[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'public_profiles';
  const q = query(collection(db, path), where('isPublished', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Array<CVProfile & { _sort: number }> = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id || docSnap.id),
          name: String(d.name || 'Untitled Profile'),
          description: String(d.description || ''),
          rolePreset: (d.rolePreset || 'custom') as CVProfile['rolePreset'],
          data: d.data as CVData,
          settings: d.settings as StudioSettings,
          updatedAt:
            typeof d.updatedAt?.toDate === 'function'
              ? d.updatedAt.toDate().toISOString()
              : new Date().toISOString(),
          _sort: typeof d.sortOrder === 'number' ? d.sortOrder : 99,
        };
      });
      items.sort((a, b) => a._sort - b._sort);
      onData(items.map(({ _sort, ...rest }) => rest));
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function savePublicSiteState(
  ownerUid: string,
  payload: {
    activeProfileId: string;
    activeData: CVData;
    activeSettings: StudioSettings;
  }
): Promise<void> {
  const path = 'public_site/main';
  const ref = doc(db, 'public_site', 'main');
  const safeProfileId = sanitizeId(payload.activeProfileId, 'prof_master');
  const safeData = stripUndefinedDeep({
    ...payload.activeData,
    name: clipText(payload.activeData.name, 140, 'Md Shoyeb Rabbi'),
    title: clipText(payload.activeData.title, 240, ''),
  });
  const safeSettings = stripUndefinedDeep(payload.activeSettings);

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, {
        activeProfileId: safeProfileId,
        activeData: safeData,
        activeSettings: safeSettings,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        activeProfileId: safeProfileId,
        activeData: safeData,
        activeSettings: safeSettings,
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function upsertPublicProfile(
  ownerUid: string,
  profile: CVProfile,
  sortOrder: number
): Promise<void> {
  const safeId = sanitizeId(profile.id, 'prof');
  const path = `public_profiles/${safeId}`;
  const ref = doc(db, 'public_profiles', safeId);

  const safeData = stripUndefinedDeep({
    ...profile.data,
    name: clipText(profile.data?.name, 140, 'Md Shoyeb Rabbi'),
    title: clipText(profile.data?.title, 240, ''),
  });
  const safeSettings = stripUndefinedDeep(profile.settings);
  const safeName = clipText(profile.name, 120, 'Profile');
  const safeDesc = clipText(profile.description, 320, '');

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, {
        name: safeName,
        description: safeDesc,
        rolePreset: profile.rolePreset,
        isPublished: true,
        sortOrder,
        data: safeData,
        settings: safeSettings,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        id: safeId,
        name: safeName,
        description: safeDesc,
        rolePreset: profile.rolePreset,
        isPublished: true,
        sortOrder,
        data: safeData,
        settings: safeSettings,
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePublicProfileCloud(profileId: string): Promise<void> {
  const safeId = sanitizeId(profileId);
  if (safeId === 'prof_master') return;
  const path = `public_profiles/${safeId}`;
  try {
    await deleteDoc(doc(db, 'public_profiles', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedCloudWorkspaceIfEmpty(
  ownerUid: string,
  payload: {
    activeProfileId: string;
    activeData: CVData;
    activeSettings: StudioSettings;
    profiles: CVProfile[];
  }
): Promise<boolean> {
  const sitePath = 'public_site/main';
  try {
    const siteSnap = await getDoc(doc(db, 'public_site', 'main'));
    if (siteSnap.exists()) return false;

    const batch = writeBatch(db);
    const safeProfileId = sanitizeId(payload.activeProfileId, 'prof_master');
    batch.set(doc(db, 'public_site', 'main'), {
      activeProfileId: safeProfileId,
      activeData: stripUndefinedDeep({
        ...payload.activeData,
        name: clipText(payload.activeData.name, 140, 'Md Shoyeb Rabbi'),
        title: clipText(payload.activeData.title, 240, ''),
      }),
      activeSettings: stripUndefinedDeep(payload.activeSettings),
      ownerUid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    payload.profiles.forEach((p, idx) => {
      const safeId = sanitizeId(p.id, 'prof');
      batch.set(doc(db, 'public_profiles', safeId), {
        id: safeId,
        name: clipText(p.name, 120, 'Profile'),
        description: clipText(p.description, 320, ''),
        rolePreset: p.rolePreset,
        isPublished: true,
        sortOrder: idx,
        data: stripUndefinedDeep(p.data),
        settings: stripUndefinedDeep(p.settings),
        ownerUid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, sitePath);
  }
}

export function subscribeCustomTemplates(
  ownerUid: string,
  onData: (templates: CustomTemplatePreset[]) => void
): Unsubscribe {
  const path = `owner_workspaces/${ownerUid}/custom_templates`;
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: CustomTemplatePreset[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id || docSnap.id),
          name: String(d.name || 'Custom Template'),
          description: String(d.description || ''),
          settingsSnapshot: (d.settingsSnapshot || {}) as Partial<StudioSettings>,
          createdAt:
            typeof d.createdAt?.toDate === 'function'
              ? d.createdAt.toDate().toISOString()
              : new Date().toISOString(),
        };
      });
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function upsertCustomTemplateCloud(
  ownerUid: string,
  tpl: CustomTemplatePreset
): Promise<void> {
  const safeId = sanitizeId(tpl.id, 'ctpl');
  const path = `owner_workspaces/${ownerUid}/custom_templates/${safeId}`;
  const ref = doc(db, 'owner_workspaces', ownerUid, 'custom_templates', safeId);

  try {
    const existingSnap = await getDoc(ref);
    const snapshotClean = stripUndefinedDeep(tpl.settingsSnapshot);
    const safeName = clipText(tpl.name, 120, 'Custom Template');
    const safeDesc = clipText(tpl.description, 240, '');

    if (existingSnap.exists()) {
      await updateDoc(ref, {
        name: safeName,
        description: safeDesc,
        settingsSnapshot: snapshotClean,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        id: safeId,
        ownerUid,
        name: safeName,
        description: safeDesc,
        settingsSnapshot: snapshotClean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomTemplateCloud(
  ownerUid: string,
  tplId: string
): Promise<void> {
  const safeId = sanitizeId(tplId);
  const path = `owner_workspaces/${ownerUid}/custom_templates/${safeId}`;
  try {
    await deleteDoc(doc(db, 'owner_workspaces', ownerUid, 'custom_templates', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeJobApplications(
  ownerUid: string,
  onData: (apps: JobApplication[]) => void
): Unsubscribe {
  const path = `owner_workspaces/${ownerUid}/job_applications`;
  const q = query(collection(db, path), where('ownerUid', '==', ownerUid));
  return onSnapshot(
    q,
    (snapshot) => {
      const list: JobApplication[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: String(d.id || docSnap.id),
          company: String(d.company || ''),
          role: String(d.role || ''),
          appliedDate: String(d.appliedDate || ''),
          profileName: String(d.profileName || 'Master Executive'),
          status: (d.status || 'Applied') as JobApplication['status'],
          url: typeof d.url === 'string' && d.url ? d.url : undefined,
          notes: typeof d.notes === 'string' && d.notes ? d.notes : undefined,
        };
      });
      list.sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
      onData(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function upsertJobApplicationCloud(
  ownerUid: string,
  app: JobApplication
): Promise<void> {
  const safeId = sanitizeId(app.id, 'app');
  const path = `owner_workspaces/${ownerUid}/job_applications/${safeId}`;
  const ref = doc(db, 'owner_workspaces', ownerUid, 'job_applications', safeId);

  const basePayload: Record<string, unknown> = {
    company: clipText(app.company, 140, 'Company'),
    role: clipText(app.role, 140, 'Role'),
    status: app.status,
    appliedDate: clipText(app.appliedDate, 40, ''),
    profileName: clipText(app.profileName || 'Master Executive', 120),
    updatedAt: serverTimestamp(),
  };
  if (app.url) basePayload.url = clipText(app.url, 400);
  if (app.notes) basePayload.notes = clipText(app.notes, 1500);

  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, basePayload);
    } else {
      await setDoc(ref, {
        ...basePayload,
        id: safeId,
        ownerUid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteJobApplicationCloud(
  ownerUid: string,
  appId: string
): Promise<void> {
  const safeId = sanitizeId(appId);
  const path = `owner_workspaces/${ownerUid}/job_applications/${safeId}`;
  try {
    await deleteDoc(doc(db, 'owner_workspaces', ownerUid, 'job_applications', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
