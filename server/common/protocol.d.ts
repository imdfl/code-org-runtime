interface IScriptContent {
	raw: string,
	rendered: string
}

interface IScriptRecord {
	name: string;
	id: string;
	url: string;
	rawUrl: string;
	author: string
	modification: Date,
	content: IScriptContent
}

interface INOUser {
	
	/**
	 * The login name of the user
	 */
	name: string;
	/**
	 * Sanitized name, used by server side functions
	 */
	id: string;
}


