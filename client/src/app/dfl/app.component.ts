import { Component, OnInit } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';
import { Router, NavigationStart } from '@angular/router';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class DFLAppComponent implements OnInit {
	public title = 'dfl-code-runtime';
	public isCollapsed = true;

	constructor(private _router: Router) {
		setTheme("bs4");
	}
	ngOnInit(): void {
		this._router.events.subscribe(e => {
			if (e instanceof NavigationStart) {
				console.log(e);
			}
		});
	}

	public get isSignedIn(): boolean {
		return false;
	}

}
