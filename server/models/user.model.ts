
/// <reference types="../common/protocol" />

export interface INOServerUser extends INOUser {
	/**
	 * The full OS path of the user's assets folder
	 */
	path: string;
	/**
	 * the path leading to this user's assets, as used by clients, e.g. /scripts/dfl,
	 * no training slash
	 */
	clientPath: string;

	/**
	 * The folder in which to write this user's rendered scripts
	 */
	renderPath: string;
}
