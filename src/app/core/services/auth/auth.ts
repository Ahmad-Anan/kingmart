import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { computed, inject, PLATFORM_ID, Service, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  IAuthResponse,
  IChangePasswordRequest,
  IForgotPasswordRequest,
  IResetPasswordRequest,
  IResetPasswordResponse,
  ISigninRequest,
  ISignupRequest,
  IStatusMessageResponse,
  IUpdateUserRequest,
  IUpdateUserResponse,
  IUser,
  IUsersResponse,
  IVerifyResetCodeRequest,
  IVerifyResetCodeResponse,
  IVerifyTokenResponse,
} from '../../models/auth';

const TOKEN_KEY = 'userToken';
const USER_KEY = 'userData';

@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly authEndpoint = `${environment.apiUrl}v1/auth`;
  private readonly usersEndpoint = `${environment.apiUrl}v1/users`;

  readonly currentUser = signal<IUser | null>(this.getStoredUser());
  readonly isLoggedIn = computed(() => !!this.currentUser());

  signup(data: ISignupRequest): Observable<IAuthResponse> {
    return this.http
      .post<IAuthResponse>(`${this.authEndpoint}/signup`, data)
      .pipe(tap((res) => this.setSession(res)));
  }

  signin(data: ISigninRequest): Observable<IAuthResponse> {
    return this.http
      .post<IAuthResponse>(`${this.authEndpoint}/signin`, data)
      .pipe(tap((res) => this.setSession(res)));
  }

  forgotPassword(data: IForgotPasswordRequest): Observable<IStatusMessageResponse> {
    return this.http.post<IStatusMessageResponse>(`${this.authEndpoint}/forgotPasswords`, data);
  }

  verifyResetCode(data: IVerifyResetCodeRequest): Observable<IVerifyResetCodeResponse> {
    return this.http.post<IVerifyResetCodeResponse>(`${this.authEndpoint}/verifyResetCode`, data);
  }

  resetPassword(data: IResetPasswordRequest): Observable<IResetPasswordResponse> {
    return this.http
      .put<IResetPasswordResponse>(`${this.authEndpoint}/resetPassword`, data)
      .pipe(tap((res) => this.saveToken(res.token)));
  }

  changePassword(data: IChangePasswordRequest): Observable<IAuthResponse> {
    return this.http
      .put<IAuthResponse>(`${this.usersEndpoint}/changeMyPassword`, data)
      .pipe(tap((res) => this.setSession(res)));
  }

  updateMe(data: IUpdateUserRequest): Observable<IUpdateUserResponse> {
    return this.http
      .put<IUpdateUserResponse>(`${this.usersEndpoint}/updateMe`, data)
      .pipe(tap((res) => this.saveUser(res.user)));
  }

  getUsers(): Observable<IUsersResponse> {
    return this.http.get<IUsersResponse>(this.usersEndpoint);
  }

  verifyToken(): Observable<IVerifyTokenResponse> {
    return this.http.get<IVerifyTokenResponse>(`${this.authEndpoint}/verifyToken`);
  }

  logout(): void {
    this.clearSession();
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(res: IAuthResponse): void {
    this.saveToken(res.token);

    // الـ signin/signup response مبيرجعش _id في الـ user object خالص — الـ ID
    // الوحيد الموجود هو claim اسمه "id" جوه الـ JWT token نفسه
    const userId = this.decodeUserIdFromToken(res.token);
    this.saveUser(userId ? { ...res.user, _id: userId } : res.user);
  }

  private decodeUserIdFromToken(token: string): string | undefined {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id;
    } catch {
      return undefined;
    }
  }

  private saveToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  private saveUser(user: IUser): void {
    this.currentUser.set(user);
    if (!this.isBrowser) return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearSession(): void {
    this.currentUser.set(null);
    if (!this.isBrowser) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private getStoredUser(): IUser | null {
    if (!this.isBrowser) return null;

    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as IUser;
    } catch {
      return null;
    }
  }
}
