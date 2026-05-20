import { Inngest } from "inngest";
import { Events } from "./events";

export const inngest = new Inngest({ 
  id: "checksy", 
  eventKey: process.env.INNGEST_EVENT_KEY || "local",
  schemas: { events: {} as unknown as Events } 
});
