
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})
export class DalService {
	private serverUrl = "http://localhost:6677";
	public constructor(private http: HttpClient) {

	}

	public async listScripts(user: string): Promise<IScriptRecord[]> {
		const url = this.makeUrl("api/list", user);
		const request = this.http.get(url, {
			responseType: "json"
		}).toPromise();

		const response: any = await request;
		if (!response || response.error) {
			return [];
		}
		return response.data;
	}

	public async listUsers(): Promise<INOUser[]> {
		const url = this.makeUrl("api/users");
		const request = this.http.get(url, {
			responseType: "json"
		}).toPromise();

		const response: any = await request;
		if (!response || response.error) {
			return [];
		}
		return response.data;
	}

	public async loadScriptContent(user: string, script: string): Promise<IScriptRecord> {
		const url = this.makeUrl("api/script", user, script);
		const request = this.http.get(url, {
			responseType: "json"
		}).toPromise();

		const response: any = await request;
		if (!response || response.error) {
			return {} as IScriptRecord;
		}
		return response.data;
	}

	private makeUrl(...args: any[]): string {
		const parts = Array.prototype.slice.apply(args || [])
			.filter(arg => arg !== undefined && arg !== null && arg !== "")
			.map(s => String(s))
			.reduce((acc: Array<string>, part: string) => {
				const comps = part.split('/').filter(Boolean);
				acc.push.apply(acc, comps);
				return acc;
			}, [])
			// remove leading and trailing slashes
			// .map(s => (s as string).replace(/^\//, ""))
			// .map(s => (s as string).replace(/\/$/, ""))
			.map(s => encodeURIComponent(s));
		parts.unshift(this.serverUrl);
		return parts.join('/');
	}
}
