import { Component, OnInit, ViewEncapsulation, SecurityContext } from '@angular/core';
import { DalService } from "@services/dal.service";
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-code-sandbox',
	templateUrl: './sandbox.component.html',
	styleUrls: ['./sandbox.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SandboxComponent implements OnInit {
	private _url: SafeUrl;
	constructor(private _sanitizer: DomSanitizer, private _dal: DalService) {
		this._url = this._sanitizer.bypassSecurityTrustResourceUrl("about:blank");
	}

	async ngOnInit(): Promise<any> {
	}

	public onNavigate(event: Event): void {
		console.log(event);
		this._url = this._sanitizer.bypassSecurityTrustResourceUrl((event.target as HTMLInputElement).value);
	}

	public get url(): SafeUrl {
		return this._url;
	}
}
