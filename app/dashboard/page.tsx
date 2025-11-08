"use client";

import { useUser, UserButton } from "@clerk/nextjs";
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
// Note: Tabs imports are no longer needed unless you add more tabs later
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

interface TranscriptRow {
  id: number;
  conversation_text: string;
  created_at: string;
}

const DashboardPage = () => {
  const { user, isLoaded } = useUser();
  const [transcripts, setTranscripts] = useState<TranscriptRow[]>([]);
  const [txError, setTxError] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState<boolean>(true);
  const [txTotalCount, setTxTotalCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("transcripts")
        .select("id, conversation_text, created_at")
        .order("created_at", { ascending: false })
        .limit(8);
      if (!mounted) return;
      if (error) {
        setTxError(error.message);
      }
      setTranscripts((data ?? []) as TranscriptRow[]);

      // fetch total count
      const { count, error: countError } = await supabase
        .from("transcripts")
        .select("id", { count: "exact", head: true });
      if (!mounted) return;
      if (countError) {
        setTxError(countError.message);
      } else {
        setTxTotalCount(count ?? 0);
      }

      setTxLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!isLoaded) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="w-[80vw] min-h-screen p-4 md:p-8 space-y-8">
      {/* CHANGE 1: Header Section
        - Changed from 'flex' to 'flex flex-col sm:flex-row'
        - Changed 'items-center' to 'sm:items-center'
        - Added 'gap-4' for spacing when stacked
      */}
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl} alt={user?.firstName || "User"} />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {/* {user?.lastName?.[0]} */}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {user?.firstName ? `${user.firstName}` : "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.firstName || "Doctor"} 👋
            </p>
          </div>
        </div>

        {/* CHANGE 1.b: Button group
          - Changed 'gap-5' to 'gap-3'
          - Removed 'justify-between' (now handled by parent)
        */}
        {/* Clerk User Menu (optional) */}
        <div className="gap-5 flex items-center justify-between">
          <Link href="/dashboard/transcription" passHref>
            {" "}
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              {" "}
              <Mic className="mr-2 h-5 w-5" /> Start Recording{" "}
            </Button>{" "}
          </Link>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* Main Content (Stats Cards) - Unchanged */}
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
            <div className="text-2xl font-bold">{txTotalCount ?? "—"}</div>
            <p className="text-xs text-muted-foreground">
              Total transcriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CHANGE 2: Transcriptions Section
        - Removed the <Tabs>, <TabsList>, and <TabsContent> wrappers
        - The <Card> now sits directly in the main layout flow
      */}
      <Card className="">
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
                <TableHead>ID</TableHead>
                <TableHead>Conversation</TableHead>
                <TableHead>Date &amp; Time</TableHead>
                {/* CHANGE 3: Added Actions column */}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txLoading && (
                <TableRow>
                  {/* CHANGE 4: Updated colSpan */}
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    Loading…
                  </TableCell>
                </TableRow>
              )}

              {txError && !txLoading && (
                <TableRow>
                  {/* CHANGE 4: Updated colSpan */}
                  <TableCell colSpan={4} className="text-center text-red-600">
                    Failed to load: {txError}
                  </TableCell>
                </TableRow>
              )}

              {!txLoading &&
                !txError &&
                transcripts.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/recordings/${t.id}`}
                        className="hover:underline"
                      >
                        {t.id}
                      </Link>
                    </TableCell>
                    <TableCell title={t.conversation_text}>
                      <Link
                        href={`/dashboard/recordings/${t.id}`}
                        className="hover:underline"
                      >
                        {t.conversation_text?.length > 140
                          ? `${t.conversation_text.slice(0, 140)}…`
                          : t.conversation_text}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(t.created_at).toLocaleString()}
                    </TableCell>
                    {/* CHANGE 3: Added Actions dropdown */}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/recordings/${t.id}`}>
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={() =>
                              alert(
                                `Delete action for ID: ${t.id}. (Wire this up!)`
                              )
                            }
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

              {!txLoading && !txError && transcripts.length === 0 && (
                <TableRow>
                  {/* CHANGE 4: Updated colSpan */}
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No recent recordings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
