import ical, {VEvent} from "node-ical";
import {EventType, UniversityEvent} from "./data/event";
import {generateCalendar} from "./gen";

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);
        if (!url.pathname.startsWith("/itservice/")) {
            return new Response(JSON.stringify({success: false, message: "Invalid URL"}), {status: 400});
        }

        const nclCalendar = `https://m.ncl.ac.uk${url.pathname}${url.search}`;
        const events = await ical.async.fromURL(nclCalendar);
        const uniEvents = Object.values(events)
            .filter(event => event.type === "VEVENT")
            .map(parseEvent);

        const response = new Response(await generateCalendar(uniEvents, env.GOOGLE_MAPS_API_KEY, env.KV));
        response.headers.set("Content-Type", "text/calendar; charset=utf-8");
        response.headers.set("Content-Disposition", 'attachment; filename="timetable.ics"');

        return response;
    },
} satisfies ExportedHandler<{
    GOOGLE_MAPS_API_KEY: string;
    KV: KVNamespace }>;

const locationFixes = {
    "Science Central": "Newcastle Helix",
    "FDC": "Frederick Douglass Centre"
};

function normaliseLocation(raw: string) {
    let normalised = raw;
    for (const [quirk, replacement] of Object.entries(locationFixes)) {
        if (normalised.includes(quirk)) {
            normalised = normalised.replace(quirk, replacement);
        }
    }
    return normalised;
}

function parseEvent(event: VEvent): UniversityEvent {
    const description = event.description.split("\n");
    const module = description[0];
    const eventType = description[1];
    const lecturers = description[2].split(",");
    const location = description[3].split(", ");


    let type: EventType | undefined = undefined;
    switch (eventType) {
        case "Lecture":
            type = "lecture";
            break;
        case "Practical":
            type = "practical";
            break;
    }

    return {
        type,
        module,
        lecturers,
        location: normaliseLocation(location.splice(location.length - 2).join(", ")),
        room: event.location,
        start: event.start,
        end: event.end
    };
}