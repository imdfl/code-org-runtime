export var Similarity;
(function (Similarity) {
    Similarity[Similarity["Identical"] = 0] = "Identical";
    /**
     * Same properties but different x, y
     */
    Similarity[Similarity["Similar"] = 1] = "Similar";
    /**
     * Can be used but need to re-apply properties
     */
    Similarity[Similarity["SameType"] = 2] = "SameType";
    Similarity[Similarity["None"] = 3] = "None";
})(Similarity || (Similarity = {}));
export class ObjectRecycler {
    constructor(root) {
        this.root = root;
        this._objects = [];
        this._requests = [];
    }
    addRequest(req) {
        this._requests.push(req);
    }
    update() {
        const candidates = this._objects;
        const newObjects = [];
        const requests = this._requests.map(r => ({
            req: r,
            same: null,
            similar: [],
            sameType: []
        }));
        // 1. Find identical objects and remove them from the candidates list
        requests.forEach(r => {
            let result = Similarity.None;
            let obj;
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
//# sourceMappingURL=object-recycler.js.map