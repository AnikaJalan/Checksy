import { Inngest } from "inngest";
import { Events } from "./events";

export const inngest = new Inngest({ 
  id: "checksy", 
  eventKey: process.env.INNGEST_EVENT_KEY || "local",
  baseUrl: process.env.NODE_ENV !== "production" ? "http://127.0.0.1:8288/" : undefined,
  schemas: { events: {} as unknown as Events } 
});
