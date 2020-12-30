import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Member} from '../models/member';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
  baseUlr = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(this.baseUlr + 'users');
  }

  getMember(username: string): Observable<Member> {
    return this.http.get<Member>(this.baseUlr + 'users/' + username);
  }

}
