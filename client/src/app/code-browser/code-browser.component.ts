import { Component, OnInit } from '@angular/core';
import { DalService } from '../services/dal.service';

@Component({
	selector: 'app-code-browser',
	templateUrl: './code-browser.component.html',
	styleUrls: ['./code-browser.component.scss']
})
export class CodeBrowserComponent implements OnInit {
	private _scripts: Array<string>;

	constructor(private dal: DalService) { }

	async ngOnInit(): Promise<any> {
		const scripts = await this.dal.listScripts();
		if (scripts && scripts.length > 0) {
			this._scripts = scripts.map(s => s.name);
		}
	}

	public get scripts(): string[] {
		return this._scripts;
	}

}
