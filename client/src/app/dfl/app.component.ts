import { Component } from '@angular/core';
import { setTheme } from 'ngx-bootstrap/utils';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class DFLAppComponent {
	constructor() {
		setTheme("bs4");
	}

	public get isSignedIn(): boolean {
		return false;
	}

	title = 'dfl-code-runtime';
	isCollapsed = true;
}
