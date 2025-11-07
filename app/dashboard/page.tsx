"use client";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardClock,
  Podcast,
  Timer,
  Mic,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const allTranscriptions = [
  {
    id: "REC-001",
    patient: "John Doe",
    initials: "JD",
    doctor: "Dr. Reed",
    date: "2025-11-07",
    status: "Completed",
  },
  {
    id: "REC-002",
    patient: "Jane Smith",
    initials: "JS",
    doctor: "Dr. Tanaka",
    date: "2025-11-07",
    status: "Pending",
  },
  {
    id: "REC-003",
    patient: "Michael Johnson",
    initials: "MJ",
    doctor: "Dr. Sharma",
    date: "2025-11-06",
    status: "Completed",
  },
  {
    id: "REC-004",
    patient: "Emily Davis",
    initials: "ED",
    doctor: "Dr. Reed",
    date: "2025-11-06",
    status: "Failed",
  },
  {
    id: "REC-005",
    patient: "David Brown",
    initials: "DB",
    doctor: "Dr. Tanaka",
    date: "2025-11-05",
    status: "Completed",
  },
];

const DashboardPage = () => {
  return (
    <div className="w-full min-h-screen p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <Header content={"Dashboard"} className="text-3xl font-bold" />
        <Link href="/dashboard/transcription" passHref>
          <Button size="lg" className="bg-green-600 hover:bg-green-700">
            <Mic className="mr-2 h-5 w-5" />
            Start Recording
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Appointments
            </CardTitle>
            <ClipboardClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">4 remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Transcription
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3m 45s</div>
            <p className="text-xs text-muted-foreground">-12s from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transcriptions (Week)
            </CardTitle>
            <Podcast className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5 from last week</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transcriptions</CardTitle>
              <CardDescription>
                An overview of all recent transcriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTranscriptions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/file.svg" alt={tx.patient} />
                            <AvatarFallback>{tx.initials}</AvatarFallback>
                          </Avatar>
                          {tx.patient}
                        </div>
                      </TableCell>
                      <TableCell>{tx.doctor}</TableCell>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "Failed"
                              ? "destructive"
                              : tx.status === "Pending"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Transcript</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transcriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Table filtered for &quot;Pending&quot; items would go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Transcriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Table filtered for &quot;Completed&quot; items would go here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
