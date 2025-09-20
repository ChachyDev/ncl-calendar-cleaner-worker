import ical from "node-ical";
import {parseEvent} from "./data/event";
import {generateCalendar} from "./calendar";

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);
        if (!url.pathname.startsWith("/itservice/ical/ical.php")) {
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
    KV: KVNamespace
}>;