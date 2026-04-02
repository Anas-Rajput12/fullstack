import { api } from './api';

export interface User {
  id: string;
  email: string;
  role: 'account_manager' | 'creative_team' | 'marketing_analyst' | 'admin';
  created_at: string;
  last_login?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

class AuthService {
  private isAuthenticated = false;
  private user: User | null = null;

  constructor() {
    // Check for existing session on init
    this.checkAuth();
  }

  /**
   * Check if user is authenticated
   */
  checkAuth(): boolean {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        this.user = JSON.parse(userData);
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error('Invalid user data in localStorage');
        this.logout();
        return false;
      }
    }

    return false;
  }

  /**
   * Login user
   * @param credentials - Email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('[Auth] Attempting login with email:', credentials.email);
      console.log('[Auth] API call to:', '/auth/login');
      
      const response = await api.auth.login(credentials.email, credentials.password);
      const { access_token, refresh_token, user } = response.data;

      console.log('[Auth] Login successful, user:', user.email);

      // Store tokens and user data
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      this.isAuthenticated = true;
      this.user = user;

      return response.data;
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      console.error('[Auth] Error details:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    api.auth.logout();
    this.isAuthenticated = false;
    this.user = null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.user;
  }

  /**
   * Check if user has role
   * @param role - Role to check
   */
  hasRole(role: string): boolean {
    return this.user?.role === role || this.user?.role === 'admin';
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get user role
   */
  getRole(): string | null {
    return this.user?.role || null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
