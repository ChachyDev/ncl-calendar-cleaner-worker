import ical from 'ical-generator';
import {UniversityEvent} from "./data/event";

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

export async function findLocationFromGoogle(location: string, googleKey: string, KV: KVNamespace): Promise<string | undefined> {
    const url = encodeURI(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${googleKey}`)
    const res = await fetch(url);
    const data: GoogleLocationResponse = await res.json();
    if (data.status !== "OK") return undefined;

    const locationData = JSON.stringify(data);
    await KV.put(location, locationData);

    return locationData;
}

export async function findCachedLocation(key: string, KV: KVNamespace, google: string): Promise<GoogleLocationResponse | undefined> {
    const data = await KV.get(key) ?? await findLocationFromGoogle(key, google, KV);
    if (!data) return undefined;
    return JSON.parse(data);
}

export async function generateCalendar(events: UniversityEvent[], googleKey: string, KV: KVNamespace): Promise<string> {
    const calendar = ical({name: "Newcastle University"});
    calendar.timezone("Europe/London");
    for (const event of events) {
        const cacheKey = event.location;
        const location = await findCachedLocation(cacheKey, KV, googleKey)
        const building = location?.results[0];

        calendar.createEvent({
            start: event.start,
            end: event.end,
            timezone: 'Europe/London',
            summary: event.module + ` in ${event.room}`,
            description: `With ${event.lecturers.join(", ")}`,
            location: building ? {
                title: event.location,
                address: building.formatted_address,
                geo: {
                    lat: building.geometry.location.lng,
                    lon: building.geometry.location.lng
                }
            } : event.location,
        })
    }

    return calendar.toString();
}