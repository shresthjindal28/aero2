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
const page = () => {
  return (
    <div className="w-full min-h-screen p-3">
      <Header content={"Dashboard"} className="text-4xl" />
      <div className="flex flex-wrap w-full">
        <Card className="w-1/4">
          <CardHeader>
            <p className="text-accent text-sm">Today's Appointments</p>
                <h1 className="text-4xl">14</h1>
          </CardHeader>
          <CardContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default page;
