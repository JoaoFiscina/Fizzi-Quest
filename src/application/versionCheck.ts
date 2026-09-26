import { GAME_VERSION } from "../version";

const versionPattern = /^v23\.09\.2003\.\d+$/;

export async function publishedVersion(
  fetcher: typeof fetch = fetch,
): Promise<string> {
  const response = await fetcher(`/version.json?check=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok)
    throw Error("Não foi possível consultar a versão publicada.");
  const manifest: unknown = await response.json();
  if (
    !manifest ||
    typeof manifest !== "object" ||
    !("version" in manifest) ||
    typeof manifest.version !== "string" ||
    !versionPattern.test(manifest.version)
  )
    throw Error("A versão publicada está inválida.");
  return manifest.version;
}

export function updateUrl(version: string, current = window.location.href) {
  if (!versionPattern.test(version)) throw Error("Versão inválida.");
  const url = new URL(current);
  url.searchParams.set("atualizar", version);
  url.searchParams.set("t", String(Date.now()));
  return url.href;
}

export function isNewVersion(version: string) {
  return (
    versionPattern.test(version) &&
    Number(version.split(".").at(-1)) > Number(GAME_VERSION.split(".").at(-1))
  );
}
