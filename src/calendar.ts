import ical from 'ical-generator';
import {UniversityEvent} from "./data/event";
import {cleanICSLocation, findCachedLocation} from "./data/location";


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
            summary: event.module + ` (${event.moduleCode})` + ` in ${event.room}`,
            description: `With ${event.lecturers.join(", ")}`,
            location: building ? {
                title: event.location,
                address: cleanICSLocation(building.formatted_address),
                geo: {
                    lat: building.geometry.location.lat,
                    lon: building.geometry.location.lng
                }
            } : event.location
        })
    }

    return calendar.toString();
}