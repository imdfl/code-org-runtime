
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})
export class DalService {
	private serverUrl = "http://localhost:6677"
	public constructor(private http: HttpClient) {

	}

	public async listScripts(): Promise<IScriptRecord[]> {
		const url = this.makeUrl("api/list");
		const request = this.http.get(url, {
			responseType: "json"
		}).toPromise();

		const response: any = await request;
		if (!response || response.error) {
			return [];
		}
		return response.data;
	}

	private makeUrl(path: string): string {
		return [this.serverUrl, path].join('/');
	}
}
