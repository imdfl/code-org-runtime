import { Component, OnInit } from '@angular/core';
import { DalService } from '@services/dal.service';

@Component({
	selector: 'app-code-browser',
	templateUrl: './code-browser.component.html',
	styleUrls: ['./code-browser.component.scss']
})
export class CodeBrowserComponent implements OnInit {
	private _scripts: Array<IScriptRecord>;

	constructor(private dal: DalService) { }

	async ngOnInit(): Promise<any> {
		const scripts = await this.dal.listScripts();
		this._scripts = (scripts || []).slice();
	}

	public get scripts(): IScriptRecord[] {
		return this._scripts;
	}

}
