import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DalService } from "@services/dal.service"
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-code-playground',
	templateUrl: './playground.component.html',
	styleUrls: ['./playground.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class PlaygroundComponent implements OnInit {
	private _scripts: Array<IScriptRecord>;
	private _scriptData: IScriptContent = null;
	private _cmOptions: any;

	constructor(private _route: ActivatedRoute, private _dal: DalService) {
		this._scriptData = { raw: "", rendered: "", url: "", name: "" };
		this._cmOptions = {
			lineNumbers: true,
			theme: 'neo',
			mode: 'javascript'
		};
	}

	async ngOnInit(): Promise<any> {
		const name = this._route.snapshot.paramMap.get('name');
		const data = await this._dal.loadScriptContent(name);
		this._scriptData = data;
	}

	public get scriptData(): IScriptContent {
		return this._scriptData;
	}

	public get codeMirrorOptions(): any {
		return this._cmOptions;
	}


}
