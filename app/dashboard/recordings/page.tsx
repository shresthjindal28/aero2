import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const conversationRecordings = [
  {
    id: "CONV-001",
    title: "Annual Physical Exam",
    patientName: "John Doe",
    doctorName: "Dr. Evelyn Reed",
    date: "2025-11-06T09:30:00Z",
    duration: "24:15",
    status: "Transcription Complete",
  },
  {
    id: "CONV-002",
    title: "Follow-up: Blood Pressure",
    patientName: "Jane Smith",
    doctorName: "Dr. Kenji Tanaka",
    date: "2025-11-05T14:00:00Z",
    duration: "12:45",
    status: "Transcription Complete",
  },
  {
    id: "CONV-003",
    title: "New Patient Consultation",
    patientName: "Michael Johnson",
    doctorName: "Dr. Priya Sharma",
    date: "2025-11-05T11:15:00Z",
    duration: "31:02",
    status: "Processing",
  },
  {
    id: "CONV-004",
    title: "Post-Op Check-in",
    patientName: "Emily Davis",
    doctorName: "Dr. Evelyn Reed",
    date: "2025-11-04T16:20:00Z",
    duration: "08:50",
    status: "Pending Transcript",
  },
  {
    id: "CONV-005",
    title: "Medication Review",
    patientName: "David Brown",
    doctorName: "Dr. Kenji Tanaka",
    date: "2025-11-04T10:00:00Z",
    duration: "15:30",
    status: "Transcription Complete",
  },
  {
    id: "CONV-006",
    title: "Initial Assessment",
    patientName: "Sarah Wilson",
    doctorName: "Dr. Priya Sharma",
    date: "2025-11-03T13:45:00Z",
    duration: "22:05",
    status: "Transcription Failed",
  },
];

const Page = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8  flex items-center justify-center flex-col gap-8">
      <Header
        content={"Activity History"}
        className="text-3xl font-bold mb-8"
      />

      <Card className="w-[70vw]">
        <CardHeader>
          <CardTitle>Recent Records</CardTitle>
          <CardDescription>
            A log of recent activity on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversationRecordings.map((recording) => (
                <TableRow key={recording.id}>
                  <TableCell className="font-medium">
                    {recording.title}
                  </TableCell>
                  <TableCell>{recording.patientName}</TableCell>
                  <TableCell>{recording.doctorName}</TableCell>
                  <TableCell>
                    {new Date(recording.date).toLocaleString()}
                  </TableCell>
                  <TableCell>{recording.duration}</TableCell>
                  <TableCell>
                    {/* You can customize badge variants based on status */}
                    <Badge
                      variant={
                        recording.status === "Transcription Failed"
                          ? "destructive"
                          : recording.status === "Processing"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {recording.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
