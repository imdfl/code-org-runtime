import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DalService } from "@services/dal.service";
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-code-playground',
	templateUrl: './playground.component.html',
	styleUrls: ['./playground.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PlaygroundComponent implements OnInit {
	private _scriptData: IScriptRecord = null;
	private _cmOptions: any;
	private _user: string;

	constructor(private _route: ActivatedRoute, private _dal: DalService) {
		// protect agains null access
		this._scriptData = { content: {} as IScriptContent } as IScriptRecord;
		this._cmOptions = {
			lineNumbers: true,
			theme: 'neo',
			mode: 'javascript'
		};
	}

	async ngOnInit(): Promise<any> {
		this._user = this._route.snapshot.paramMap.get('user');
		const name = this._route.snapshot.paramMap.get('name');
		const data = await this._dal.loadScriptContent(this._user, name);
		this._scriptData = data;
	}

	public get user(): string {
		return this._user;
	}

	public get scriptContent(): IScriptContent {
		return this._scriptData.content;
	}

	public get scriptData(): IScriptRecord {
		return this._scriptData;
	}

	public get codeMirrorOptions(): any {
		return this._cmOptions;
	}


}
