interface IScriptRecord {
	name: string;
	url: string;
	rawUrl?: string;
	author?: string
	lastModification: Date
}

interface IScriptContent {
	name: string,
	url: string,
	raw: string,
	rendered: string
}

