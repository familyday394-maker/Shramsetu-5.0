/**
 * Shram Setu 2.0 - Role-Based Authentication & Contact Verification Engine
 * Handles user lifecycle for Workers and Contractors with Supabase Cloud Auth support
 * and an isolated, fully compliant Local Demo fallback when backend keys are unconfigured.
 * 
 * Strict Security Rules:
 * 1. Passwords are NEVER stored in localStorage or IndexedDB.
 * 2. "Remember my login ID" stores ONLY the email/login identifier, never the password.
 * 3. Newly registered workers do NOT inherit seeded demo data.
 * 4. Signing out preserves user data without resetting the database.
 * 5. Judge Demo Mode is strictly isolated from genuine user sessions.
 */

import { UserProfile, UserRole, ContactVerificationStatus, ManualContactCheckRecord } from '../types';
import { getSupabaseStatus } from './supabase';
import { computeSha256Hex } from './cryptoAudit';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SESSION_STORAGE_KEY = 'shramsetu_auth_active_user';
const REMEMBERED_ID_KEY = 'shramsetu_remembered_login_id';
const LOCAL_USERS_KEY = 'shramsetu_registered_users_registry';

export interface AuthState {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isJudgeDemo: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

export interface SignUpParams {
  role: 'worker' | 'contractor';
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  trade?: string;
  organizationName?: string;
  consentToShareContact: boolean;
  privacyAccepted: boolean;
}

export interface SignInParams {
  loginId: string;
  password?: string;
  rememberMe?: boolean;
}

class AuthService {
  private currentUser: UserProfile | null = null;
  private isJudgeDemo = false;
  private supabase: SupabaseClient | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initSupabaseIfConfigured();
    this.restoreSessionSync();
  }

  private initSupabaseIfConfigured(): void {
    const status = getSupabaseStatus();
    if (status.isConfigured && status.url) {
      try {
        const key = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env?.VITE_SUPABASE_ANON_KEY;
        if (key) {
          this.supabase = createClient(status.url, key);
        }
      } catch (err) {
        console.warn('[Auth] Supabase client initialization skipped:', err);
      }
    }
  }

  private restoreSessionSync(): void {
    if (typeof window === 'undefined') return;

    try {
      const savedSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed: UserProfile = JSON.parse(savedSession);
        if (parsed && parsed.id && parsed.role) {
          this.currentUser = parsed;
          this.isJudgeDemo = Boolean(parsed.isJudgeDemo);
        }
      }
    } catch {
      // Safe fallback
    }
  }

  public getAuthState(): AuthState {
    const isAuthed = Boolean(this.currentUser);
    return {
      user: this.currentUser,
      role: this.currentUser ? this.currentUser.role : 'public_visitor',
      isAuthenticated: isAuthed,
      isJudgeDemo: this.isJudgeDemo,
      isLoading: false,
      errorMessage: null,
    };
  }

  public subscribe(cb: (state: AuthState) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify(): void {
    const state = this.getAuthState();
    this.listeners.forEach((cb) => cb(state));
  }

  /**
   * Generates a collision-resistant opaque token for permanent QR passes
   */
  public generateOpaqueToken(prefix: string = 'SS2'): string {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${prefix}-${randomHex.slice(0, 8)}-${Date.now().toString(36)}`;
  }

  /**
   * Register a new Worker or Contractor
   */
  public async signUp(params: SignUpParams): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    if (!params.fullName || params.fullName.trim().length < 2) {
      return { success: false, error: 'Please enter a valid full name (minimum 2 characters).' };
    }

    if (!params.phone || !/^\+?[0-9\s-]{10,14}$/.test(params.phone.replace(/[\s-]/g, ''))) {
      return { success: false, error: 'Please provide a valid mobile number with country code (e.g. +91 98260 12345).' };
    }

    if (!params.privacyAccepted) {
      return { success: false, error: 'Consent to the Shram Setu privacy and data use terms is required.' };
    }

    // Try Supabase Auth if connected
    if (this.supabase && params.email && params.password) {
      try {
        const { data, error } = await this.supabase.auth.signUp({
          email: params.email,
          password: params.password,
          options: {
            data: {
              full_name: params.fullName,
              phone: params.phone,
              role: params.role,
              trade: params.trade || '',
              organization_name: params.organizationName || '',
            },
          },
        });
        if (error) {
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.warn('[Auth] Remote Supabase sign up skipped, using secure local registry:', err);
      }
    }

    // Check if phone or email is already registered locally
    const existingUsers = this.getLocalUsers();
    const cleanPhone = params.phone.replace(/\D/g, '');
    const alreadyExists = existingUsers.some((u) => {
      const uPhone = u.phone.replace(/\D/g, '');
      return uPhone === cleanPhone || (params.email && u.email && u.email.toLowerCase() === params.email.toLowerCase());
    });

    if (alreadyExists) {
      return { success: false, error: 'An account with this mobile number or email already exists. Please Sign In.' };
    }

    const userId = params.role === 'worker' 
      ? `WKR-${Date.now().toString().slice(-6)}`
      : `CTR-${Date.now().toString().slice(-6)}`;

    const opaqueToken = this.generateOpaqueToken(params.role === 'worker' ? 'WKR' : 'CTR');

    // Create user profile
    const newUser: UserProfile = {
      id: userId,
      email: params.email?.trim() || undefined,
      phone: params.phone.trim(),
      fullName: params.fullName.trim(),
      role: params.role,
      trade: params.role === 'worker' ? (params.trade || 'General Construction Worker') : undefined,
      organizationName: params.role === 'contractor' ? (params.organizationName || 'Independent Contractor') : undefined,
      contactVerificationStatus: 'number_supplied',
      manualChecks: [],
      consentToShareContact: params.consentToShareContact,
      privacyAccepted: true,
      qrReferenceToken: opaqueToken,
      assignedWorkerIds: params.role === 'contractor' ? [] : undefined,
      createdAt: new Date().toISOString(),
      isJudgeDemo: false,
    };

    // Store in local users registry (Password is NOT stored in plain text or local storage)
    // For local verification, we compute a salted hash in memory
    const passwordHash = params.password ? await computeSha256Hex(`salt_${userId}_${params.password}`) : '';

    this.saveLocalUser(newUser, passwordHash);

    // Set as active authenticated session
    this.currentUser = newUser;
    this.isJudgeDemo = false;
    this.saveSession(newUser);
    this.notify();

    return { success: true, user: newUser };
  }

  /**
   * Sign In with Email or Mobile Number
   */
  public async signIn(params: SignInParams): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    const cleanInput = params.loginId.trim();
    if (!cleanInput) {
      return { success: false, error: 'Please enter your registered mobile number or email.' };
    }

    // Handle "Remember my login ID"
    if (params.rememberMe) {
      this.setRememberedLoginId(cleanInput);
    } else {
      this.clearRememberedLoginId();
    }

    // Try Supabase Auth when configured and an email address is used. A remote
    // failure must NOT block local accounts — the registry is the offline-first
    // source of truth — so the error is held back until the local lookup fails.
    let remoteUser: any = null;
    let remoteError: string | null = null;
    if (this.supabase && cleanInput.includes('@') && params.password) {
      try {
        const { data, error } = await this.supabase.auth.signInWithPassword({
          email: cleanInput,
          password: params.password,
        });
        if (error) {
          remoteError = error.message;
        } else {
          remoteUser = data?.user ?? null;
        }
      } catch (err: any) {
        console.warn('[Auth] Remote Supabase sign in fallback to local registry:', err);
      }
    }

    // Check local registry
    const registry = this.getLocalUsers();
    const cleanPhoneDigits = cleanInput.replace(/\D/g, '');

    let found = registry.find((u) => {
      const userPhoneDigits = u.phone.replace(/\D/g, '');
      const matchPhone = cleanPhoneDigits.length >= 10 && userPhoneDigits.includes(cleanPhoneDigits);
      const matchEmail = u.email && u.email.toLowerCase() === cleanInput.toLowerCase();
      const matchId = u.id.toLowerCase() === cleanInput.toLowerCase();
      return matchPhone || matchEmail || matchId;
    });

    // Authenticated in Supabase but unknown locally (e.g. signed up on another
    // device): rebuild the local profile from the Supabase metadata.
    if (!found && remoteUser) {
      const meta = (remoteUser.user_metadata || {}) as Record<string, string>;
      found = {
        id: remoteUser.id,
        email: remoteUser.email || cleanInput,
        phone: meta.phone || '',
        fullName: meta.full_name || remoteUser.email?.split('@')[0] || 'Registered user',
        role: meta.role === 'contractor' ? 'contractor' : 'worker',
        trade: meta.trade || undefined,
        organizationName: meta.organization_name || undefined,
        contactVerificationStatus: 'number_supplied',
        manualChecks: [],
        consentToShareContact: true,
        privacyAccepted: true,
        qrReferenceToken: this.generateOpaqueToken(meta.role === 'contractor' ? 'CTR' : 'WKR'),
        createdAt: new Date().toISOString(),
        isJudgeDemo: false,
      };
      this.saveLocalUser(found, '');
    }

    if (!found) {
      return {
        success: false,
        error:
          remoteError ||
          'No registered account found with these details. Please create an account or verify your mobile number.',
      };
    }

    // Verify password hash if one was registered and provided
    if (params.password) {
      const storedCreds = this.getLocalCreds(found.id);
      if (storedCreds) {
        const inputHash = await computeSha256Hex(`salt_${found.id}_${params.password}`);
        if (storedCreds !== inputHash) {
          return { success: false, error: 'Incorrect password. Please try again or use Password Recovery.' };
        }
      }
    }

    this.currentUser = found;
    this.isJudgeDemo = false;
    this.saveSession(found);
    this.notify();

    return { success: true, user: found };
  }

  /**
   * Sign Out (Clears session without deleting or resetting user records!)
   */
  public async signOut(): Promise<void> {
    if (this.supabase) {
      try {
        await this.supabase.auth.signOut();
      } catch {
        // ignore
      }
    }

    this.currentUser = null;
    this.isJudgeDemo = false;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    this.notify();
  }

  /**
   * Password Recovery Request
   */
  public async requestPasswordRecovery(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    if (this.supabase) {
      try {
        await this.supabase.auth.resetPasswordForEmail(email);
      } catch {
        // fallback
      }
    }

    return {
      success: true,
      message: `If an account is associated with ${email}, password reset instructions have been dispatched.`,
    };
  }

  /**
   * Isolated Judge Demo Entry
   */
  public enterJudgeDemo(role: 'worker' | 'contractor' = 'worker', workerProfile?: Partial<UserProfile>): void {
    const demoUser: UserProfile = {
      id: role === 'worker' ? (workerProfile?.id || 'WKR-MP-001') : 'CTR-IND-METRO',
      email: 'judge-demo@shramsetu.gov.demo',
      phone: role === 'worker' ? '+91 98260 14820' : '+91 731 2928100',
      fullName: role === 'worker' ? (workerProfile?.fullName || 'Rameshwar Lal Ahirwar (Demo)') : 'Anil Sisodiya (Contractor Demo)',
      role,
      trade: role === 'worker' ? 'Head Mason (मुख्य राजमिस्त्री)' : undefined,
      organizationName: role === 'contractor' ? 'Narmada Infra & Urban Engineering Ltd.' : undefined,
      contactVerificationStatus: 'manual_check_completed',
      manualChecks: [
        {
          id: 'CHK-DEMO-01',
          targetUserId: 'WKR-MP-001',
          targetPhone: '+91 98260 14820',
          checkedByUserId: 'CTR-IND-METRO',
          checkedByName: 'Anil Sisodiya',
          checkedByRole: 'contractor',
          checkedAt: '2026-10-20T10:30:00Z',
          outcome: 'confirmed_match',
          notes: 'Personal telephonic check verified with worker prior to muster deployment.',
        },
      ],
      consentToShareContact: true,
      privacyAccepted: true,
      qrReferenceToken: 'WKR-DEMO-OPAQUE-TOKEN-001',
      assignedWorkerIds: ['WKR-MP-001', 'WKR-MP-002', 'WKR-MP-003', 'WKR-MP-004', 'WKR-MP-005'],
      createdAt: '2026-01-01T00:00:00Z',
      isJudgeDemo: true,
    };

    this.currentUser = demoUser;
    this.isJudgeDemo = true;
    this.saveSession(demoUser);
    this.notify();
  }

  /**
   * Records a manual mutual contact cross-check performed by an authorized counterpart
   */
  public recordManualContactCheck(
    targetUserId: string,
    targetPhone: string,
    outcome: ManualContactCheckRecord['outcome'],
    notes: string = ''
  ): ManualContactCheckRecord | null {
    if (!this.currentUser) return null;

    const checkRecord: ManualContactCheckRecord = {
      id: `CHK-${Date.now().toString().slice(-6)}`,
      targetUserId,
      targetPhone,
      checkedByUserId: this.currentUser.id,
      checkedByName: this.currentUser.fullName,
      checkedByRole: this.currentUser.role,
      checkedAt: new Date().toISOString(),
      outcome,
      notes: notes.trim(),
    };

    // Update target user's contact verification status in registry
    const users = this.getLocalUsers();
    const target = users.find((u) => u.id === targetUserId);
    if (target) {
      target.manualChecks = [...(target.manualChecks || []), checkRecord];
      if (outcome === 'confirmed_match') {
        target.contactVerificationStatus = 'manual_check_completed';
      } else if (outcome === 'details_mismatch' || outcome === 'reported_suspicious') {
        target.contactVerificationStatus = 'disputed_or_review';
      }
      this.updateUserInRegistry(target);
    }

    // Also update current user if they were the target
    if (this.currentUser.id === targetUserId) {
      this.currentUser.manualChecks = [...(this.currentUser.manualChecks || []), checkRecord];
      if (outcome === 'confirmed_match') {
        this.currentUser.contactVerificationStatus = 'manual_check_completed';
      } else if (outcome === 'details_mismatch' || outcome === 'reported_suspicious') {
        this.currentUser.contactVerificationStatus = 'disputed_or_review';
      }
      this.saveSession(this.currentUser);
    }

    this.notify();
    return checkRecord;
  }

  /**
   * Update Profile Details
   */
  public updateProfile(updates: Partial<UserProfile>): void {
    if (!this.currentUser) return;

    this.currentUser = {
      ...this.currentUser,
      ...updates,
    };
    this.saveSession(this.currentUser);
    this.updateUserInRegistry(this.currentUser);
    this.notify();
  }

  // --------------------------------------------------------------------------
  // Helpers & Local Storage Persistence
  // --------------------------------------------------------------------------
  private saveSession(user: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  }

  public getLocalUsers(): UserProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = window.localStorage.getItem(LOCAL_USERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalUser(user: UserProfile, passwordHash: string): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getLocalUsers();
      current.unshift(user);
      window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(current));

      if (passwordHash) {
        window.localStorage.setItem(`shramsetu_pwd_hash_${user.id}`, passwordHash);
      }
    } catch {
      // ignore
    }
  }

  private updateUserInRegistry(user: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getLocalUsers();
      const idx = current.findIndex((u) => u.id === user.id);
      if (idx !== -1) {
        current[idx] = user;
        window.localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(current));
      }
    } catch {
      // ignore
    }
  }

  private getLocalCreds(userId: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(`shramsetu_pwd_hash_${userId}`);
    } catch {
      return null;
    }
  }

  public getRememberedLoginId(): string {
    if (typeof window === 'undefined') return '';
    try {
      return window.localStorage.getItem(REMEMBERED_ID_KEY) || '';
    } catch {
      return '';
    }
  }

  public setRememberedLoginId(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(REMEMBERED_ID_KEY, id);
    } catch {
      // ignore
    }
  }

  public clearRememberedLoginId(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(REMEMBERED_ID_KEY);
    } catch {
      // ignore
    }
  }
}

export const auth = new AuthService();
