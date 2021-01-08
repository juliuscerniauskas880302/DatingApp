import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Member} from '../models/member';
import {Observable, of} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {PaginatedResult} from '../models/Pagination';
import {UserParams} from '../models/userParams';
import {AccountService} from './account.service';
import {User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUlr = environment.apiUrl;
  members: Member[] = [];
  memberCache = new Map();
  user: User;
  userParams: UserParams;

  constructor(private http: HttpClient, private accountService: AccountService) {
    this.accountService.currentUser$.pipe(take(1)).subscribe(u => {
      this.user = u;
      this.userParams = new UserParams(u);
    });
  }

  getUserParams(): UserParams {
    return this.userParams;
  }

  setUserParams(params: UserParams): void {
    this.userParams = params;
  }

  resetUserParams(): UserParams {
    this.userParams = new UserParams(this.user);
    return this.userParams;
  }

  getMembers(userParams: UserParams): Observable<PaginatedResult<Member[]>> {
    const response = this.memberCache.get(Object.values(userParams).join('-'));
    if (response) {
      return of(response);
    }
    let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return this.getPaginatedResult<Member[]>(this.baseUlr + 'users', params)
      .pipe(map(res => {
        this.memberCache.set(Object.values(userParams).join('-'), res);
        return res;
      }));
  }

  getMember(username: string): Observable<Member> {
    const member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.result), [])
      .find((mem: Member) => mem.username === username);

    if (member) {
      return of(member);
    }

    return this.http.get<Member>(this.baseUlr + 'users/' + username);
  }

  updateMember(member: Member): Observable<any> {
    return this.http.put(this.baseUlr + 'users', member).pipe(
      map(() => {
        const index = this.members.indexOf(member);
        this.members[index] = member;
      })
    );
  }

  setMainPhoto(photoId: number): Observable<any> {
    return this.http.put(this.baseUlr + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number): Observable<any> {
    return this.http.delete(this.baseUlr + 'users/delete-photo/' + photoId);
  }

  private getPaginatedResult<T>(url: string, params: HttpParams): Observable<PaginatedResult<T>> {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>();

    return this.http.get<T>(url, {observe: 'response', params}).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') != null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })
    );
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number): HttpParams {
    let params = new HttpParams();

    params = params.append('pageNumber', pageNumber.toString());
    params = params.append('pageSize', pageSize.toString());

    return params;
  }

}
