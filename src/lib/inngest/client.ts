import { Inngest } from "inngest";
import { Events } from "./events";

export const inngest = new Inngest({ id: "checksy", schemas: { events: {} as unknown as Events } });
