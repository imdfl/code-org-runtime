import { Component, OnInit } from '@angular/core';
import { DalService } from '@services/dal.service';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-code-browser',
	templateUrl: './code-browser.component.html',
	styleUrls: ['./code-browser.component.scss']
})
export class CodeBrowserComponent implements OnInit {
	private _scripts: Array<IScriptRecord>;
	private _user: string = null;

	constructor(private _route: ActivatedRoute, private dal: DalService) { }

	async ngOnInit(): Promise<any> {
		this._user = this._route.snapshot.paramMap.get('user');
		const scripts = await this.dal.listScripts(this._user);
		this._scripts = (scripts || []).slice();
	}

	public get scripts(): IScriptRecord[] {
		return this._scripts;
	}

	public sandboxLink(script: string): string {
		return ["/script", this._user, script].join('/');
	}

}
