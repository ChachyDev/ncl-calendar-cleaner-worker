import {DateWithTimeZone} from "node-ical";

export type EventType = "lecture" | "practical"

export type UniversityEvent = {
    type?: EventType;
    module: string;
    lecturers: string[];
    location: string;
    room: string;
    start: DateWithTimeZone;
    end: DateWithTimeZone;
}