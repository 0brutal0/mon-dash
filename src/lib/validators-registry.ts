/**
 * Fetches validator metadata from the community-maintained registry at
 * https://github.com/monad-developers/validator-info. Each mainnet validator
 * publishes a JSON file keyed by SECP key containing their name, website,
 * X handle, and description. The file's `id` field matches the validator
 * ID used by the staking precompile.
 */

export interface ValidatorMetadata {
  id: number;
  name: string;
  website?: string;
  x?: string;
  description?: string;
  secp: string;
  bls: string;
}

interface GhContent {
  name: string;
  download_url: string;
}

const REGISTRY_API =
  "https://api.github.com/repos/monad-developers/validator-info/contents/mainnet";

const LIST_REVALIDATE = 3600;
const FILE_REVALIDATE = 3600;
const FETCH_BATCH = 40;

export async function getValidatorRegistry(): Promise<Map<number, ValidatorMetadata>> {
  const map = new Map<number, ValidatorMetadata>();

  let entries: GhContent[] = [];
  try {
    const res = await fetch(REGISTRY_API, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: LIST_REVALIDATE },
    });
    if (!res.ok) return map;
    entries = (await res.json()) as GhContent[];
  } catch {
    return map;
  }

  const files = entries.filter((e) => e.name.endsWith(".json") && e.download_url);

  for (let i = 0; i < files.length; i += FETCH_BATCH) {
    const batch = files.slice(i, i + FETCH_BATCH);
    const metas = await Promise.all(
      batch.map(async (f) => {
        try {
          const r = await fetch(f.download_url, { next: { revalidate: FILE_REVALIDATE } });
          if (!r.ok) return null;
          return (await r.json()) as ValidatorMetadata;
        } catch {
          return null;
        }
      })
    );
    for (const m of metas) {
      if (m && typeof m.id === "number" && m.name) map.set(m.id, m);
    }
  }

  return map;
}
