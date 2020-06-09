

export class CodeUtils {
	private static NAME_RE = /\.js$/i;
	private static IMAGE_RE = /\.png$/i;
	public static makeScriptName(name: string): string {
		return (name || "").trim().replace(CodeUtils.NAME_RE, "");
	}

	public static makeImageName(name: string): string {
		return (name || "").trim().replace(CodeUtils.IMAGE_RE, "");
	}
}
