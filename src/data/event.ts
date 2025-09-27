import {DateWithTimeZone, VEvent} from "node-ical";
import {normaliseLocation} from "./location";

export type EventType = "lecture" | "practical"
export type UniversityEvent = {
    type?: EventType;
    module: string;
    moduleCode: string;
    lecturers: string[];
    location: string;
    room: string;
    start: DateWithTimeZone;
    end: DateWithTimeZone;
}

export function parseEvent(event: VEvent): UniversityEvent {
    const description = event.description.split("\n");
    const module = description[0];
    const moduleCode = event.summary.split(" ")[0].split("/")[0];
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
        moduleCode,
        lecturers,
        location: normaliseLocation(location.splice(location.length - 2).join(", ")),
        room: event.location,
        start: event.start,
        end: event.end
    };
}