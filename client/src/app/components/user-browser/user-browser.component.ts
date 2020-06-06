import { Component, OnInit } from '@angular/core';
import { DalService } from '@services/dal.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-user-browser',
	templateUrl: './user-browser.component.html',
	styleUrls: ['./user-browser.component.scss']
})
export class UserBrowserComponent implements OnInit {
	private _users: Array<INOUser>;

	constructor(private _route: ActivatedRoute, private dal: DalService) { }

	async ngOnInit(): Promise<any> {
		const users = await this.dal.listUsers();
		this._users = (users || []).slice();
	}

	public get users(): INOUser[] {
		return this._users;
	}

}
