import {Component, OnInit} from '@angular/core';
import {Member} from '../../models/member';
import {MembersService} from '../../services/members.service';
import {Pagination} from '../../models/Pagination';
import {PageChangedEvent} from 'ngx-bootstrap/pagination';
import {UserParams} from '../../models/userParams';
import {AccountService} from '../../services/account.service';
import {take} from 'rxjs/operators';
import {User} from '../../models/user';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
  members: Member[];
  pagination: Pagination;
  userParams: UserParams;
  user: User;
  genderList = [{value: 'male', display: 'Males'}, {value: 'female', display: 'Females'}];

  constructor(private memberService: MembersService) {
    this.userParams = this.memberService.getUserParams();
  }

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.memberService.setUserParams(this.userParams);
    this.memberService.getMembers(this.userParams).subscribe(response => {
      this.members = response.result;
      this.pagination = response.pagination;
    });
  }

  resetFilters(): void {
    this.userParams = this.memberService.resetUserParams();
    this.loadMembers();
  }

  pageChanged($event: PageChangedEvent): void {
    this.userParams.pageNumber = $event.page;
    this.memberService.setUserParams(this.userParams);
    this.loadMembers();
  }
}
