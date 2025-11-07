import Header from "@/components/Header";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardClock, Podcast, Timer } from "lucide-react";
const page = () => {
  return (
    <div className="w-full min-h-screen p-3">
      <Header content={"Dashboard"} className="text-3xl" />
      <div className="flex flex-wrap justify-center mt-5 w-full">
        <Card className="min-w-1/4 m-3">
          <CardHeader>
            <p className="text-muted-foreground text-sm">Today's Appointments</p>
            <div className="text-3xl flex justify-start items-center gap-2">
              {" "}
              <ClipboardClock /> 14
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-primary font-semibold">
            4 remaining
          </CardFooter>
        </Card>
        <Card className="min-w-1/3 m-3">
          <CardHeader>
            <p className="text-muted-foreground text-sm">Avg. Transcription</p>
            <div className="text-3xl flex justify-start items-center gap-2">
              <Timer />
              3m 45s
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-primary font-semibold">
            -12s from last week
          </CardFooter>
        </Card>
        <Card className="min-w-1/4 m-3">
          <CardHeader>
            <p className="text-muted-foreground text-sm">Transcriptions (Week)</p>
            <div className="text-3xl flex justify-start items-center gap-2">
              {" "}
              <Podcast /> 42
            </div>
          </CardHeader>
          <CardFooter className="text-sm text-primary font-semibold">
            +5 from last week
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default page;
