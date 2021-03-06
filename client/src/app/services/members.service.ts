import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Member} from '../models/member';
import {Observable, of} from 'rxjs';
import {map, take} from 'rxjs/operators';
import {PaginatedResult} from '../models/Pagination';
import {UserParams} from '../models/userParams';
import {AccountService} from './account.service';
import {User} from '../models/user';
import {getPaginatedResult, getPaginationHeaders} from './paginationHelper';

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
    let params = getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
    params = params.append('minAge', userParams.minAge.toString());
    params = params.append('maxAge', userParams.maxAge.toString());
    params = params.append('gender', userParams.gender);
    params = params.append('orderBy', userParams.orderBy);

    return getPaginatedResult<Member[]>(this.baseUlr + 'users', params, this.http)
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

  addLike(username: string): Observable<any> {
    return this.http.post(this.baseUlr + 'likes/' + username, {});
  }

  getLikes(predicate: string, pageNumber, pageSize): Observable<any> {
    let params = getPaginationHeaders(pageNumber, pageSize);
    params = params.append('predicate', predicate);

    return getPaginatedResult<Partial<Member[]>>(this.baseUlr + 'likes', params, this.http);
  }

}
