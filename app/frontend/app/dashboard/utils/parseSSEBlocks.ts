
import { Event, Payload, CompletePayload ,ErrorPayload, StreamState} from "../types";


export function parseSseBlocks(buffer: string): { events:Event[]; rest: string } {
    const parts = buffer.split("\n\n");
    const rest = parts.pop() ?? "";
    const events: Event[] = [];
    for (const block of parts) {
      if (!block.trim() || block.startsWith(":")) continue;
      let event = "message";
      const dataLines: string[] = [];
      for (const line of block.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
      }
      const data = dataLines.join("\n");
      if (data) events.push({ event, data });
    }
    return { events, rest };
  }

type StreamPayload = Payload | ErrorPayload | CompletePayload  | Record <string, null> | null



export function calculateNextStep(currentState: StreamState, event: string, payload: StreamPayload)
: Partial <StreamState>{

    if (event === "status" && payload){
        const statusData = payload as Payload
        return{
            status: statusData.status ?? currentState.status,
            progress: typeof statusData.progress === "number" ? statusData.progress : currentState.progress
        }
    }

    if (event === "complete"){
        return{
            complete: payload as CompletePayload,
            progress: 100
        }
    }

    if (event === "error" && payload){
        const errorData = payload as ErrorPayload
        const msg = "detail" in errorData ? errorData.detail: String(payload)
        if (typeof(msg) == "string"){
        return{error: msg}
        }else{
            return {error: "No se por que tuvimos un error" + msg}
        } 
}

return{};

}