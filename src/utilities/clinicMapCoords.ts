export type MapCoords = {
  latitude: number;
  longitude: number;
};

/** Pull lat/lng from common Google Maps / Apple Maps share URLs. */
export function parseCoordsFromMapLink(
  link: string | null | undefined,
): MapCoords | null {
  if (!link?.trim()) {
    return null;
  }
  const raw = link.trim();
  const at = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) {
    return toCoords(at[1], at[2]);
  }
  const q = raw.match(/[?&](?:q|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (q) {
    return toCoords(q[1], q[2]);
  }
  const d = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (d) {
    return toCoords(d[1], d[2]);
  }
  const destination = raw.match(
    /destination=(-?\d+(?:\.\d+)%2C|-?\d+(?:\.\d+),)(-?\d+(?:\.\d+)?)/i,
  );
  if (destination) {
    const lat = destination[1].replace('%2C', '').replace(',', '');
    return toCoords(lat, destination[2]);
  }
  return null;
}

function toCoords(
  latRaw: string | undefined,
  lngRaw: string | undefined,
): MapCoords | null {
  const latitude = Number(latRaw);
  const longitude = Number(lngRaw);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

/**
 * Resolve coordinates from a free-text place query (OpenStreetMap Nominatim).
 * Requires network; returns null on failure.
 */
export async function geocodePlaceQuery(
  query: string,
): Promise<MapCoords | null> {
  const q = query.trim();
  if (!q) {
    return null;
  }
  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=` +
      encodeURIComponent(q);
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'HelloHomeoPatientApp/1.0',
      },
    });
    if (!res.ok) {
      return null;
    }
    const rows = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const first = rows[0];
    return toCoords(first?.lat, first?.lon);
  } catch {
    return null;
  }
}
