type GoogleLocationResponse = {
    results: {
        formatted_address: string;
        geometry: {
            location: {
                lat: number,
                lng: number
            }
        }
    }[],
    status: "ZERO_RESULTS" | "OK"
}

async function findLocationFromGoogle(location: string, googleKey: string, KV: KVNamespace): Promise<string | undefined> {
    const url = encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleKey}`)
    const res = await fetch(url);
    const data: GoogleLocationResponse = await res.json();
    if (data.status !== "OK") return undefined;

    const locationData = JSON.stringify(data);
    await KV.put(location, locationData);

    return locationData;
}

export async function findCachedLocation(key: string, KV: KVNamespace, google: string): Promise<GoogleLocationResponse | undefined> {
    if (!key) return undefined;
    const data = await KV.get(key) ?? await findLocationFromGoogle(key, google, KV);
    if (!data) return undefined;
    return JSON.parse(data);
}

const locationFixes = {
    "Science Central": "Newcastle Helix",
    "FDC": "Frederick Douglass Centre"
};

export function normaliseLocation(raw: string) {
    let normalised = raw;
    for (const [fix, replacement] of Object.entries(locationFixes)) {
        if (normalised.includes(fix)) {
            normalised = normalised.replace(fix, replacement);
        }
    }
    return normalised;
}