import { ISJSScene } from './interfaces/sjs';

export enum Similarity { Identical,
	/**
	 * Same properties but different x, y
	 */
	Similar,
	/**
	 * Can be used but need to re-apply properties
	 */
	SameType, None }

export interface IRecyclableObject {
	x: number;
	y: number;
	compareTo(other: IRecycleRequest): Similarity;
	applyProperties(props: IRecycleRequest): void;
	dispose(): void;
}

export interface IRecycleRequest {
	type: string;
	x: number;
	y: number;
}


export abstract class ObjectRecycler<T extends IRecyclableObject, R extends IRecycleRequest> {
	private _objects: Array<T>;
	private _requests: Array<R>;
	protected constructor(protected root: HTMLElement) {
		this._objects = [];
		this._requests = [];
	}

	protected abstract createObject(root: HTMLElement): T;

	protected addRequest(req: R): void {
		this._requests.push(req);
	}

	public update(): void {
		const candidates = this._objects;
		const newObjects: T[] = [];
		const requests = this._requests.map(r => (
			{
				req: r,
				same: null as T,
				similar: [] as T[],
				sameType: [] as T[]
			}
		));
		// 1. Find identical objects and remove them from the candidates list
		requests.forEach(r => {
			let result: Similarity = Similarity.None;
			let obj: T;
			let sameIndex = -1;
			// tslint:disable-next-line: prefer-for-of
			for (let i = 0; i < candidates.length && !r.same; ++i) {
				obj = candidates[i];
				result = obj.compareTo(r.req);
				if (result === Similarity.Similar) {
					r.similar.push(obj);
				}
				else if (result === Similarity.Identical) {
					r.same = obj;
					sameIndex = i;
				}
				else if (result === Similarity.SameType) {
					r.sameType.push(obj);
				}
			}
			if (r.same) {
				candidates.splice(sameIndex, 1);
			}
		});

		requests.forEach(r => {
			if (r.same) {
				newObjects.push(r.same);
				return;
			}
			if (r.similar.length) {
				let ind = 0;
				for (const s of r.similar) {
					ind = candidates.indexOf(s);
					if (ind >= 0) {
						candidates[ind].x = r.req.x;
						candidates[ind].y = r.req.y;
						newObjects.push(candidates[ind]);
						candidates.splice(ind, 1);
						return;
					}
				}
			}
			if (r.sameType.length) {
				let ind = 0;
				for (const s of r.sameType) {
					ind = candidates.indexOf(s);
					if (ind >= 0) {
						candidates[ind].applyProperties(r.req);
						newObjects.push(candidates[ind]);
						candidates.splice(ind, 1);
						return;
					}
				}
			}
			const obj = this.createObject(this.root);
			obj.applyProperties(r.req);
			newObjects.push(obj);
		});
		this._objects = newObjects;
		candidates.forEach(c => c.dispose());
		this._requests = [];
	}
}
