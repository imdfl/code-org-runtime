

export class CodeUtils {
	private static NAME_RE = /\.js$/i;
	public static makeScriptName(name: string): string {
		return (name || "").trim().replace(CodeUtils.NAME_RE, "");
	}
}
