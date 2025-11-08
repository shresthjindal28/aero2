import Header from "@/components/Header";
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
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";

interface TranscriptRow {
  id: number;
  conversation_text: string;
  created_at: string; // ISO timestamp
}

export default async function Page() {
  const { data, error } = await supabase
    .from("transcripts")
    .select("id, conversation_text, created_at")
    .order("created_at", { ascending: false });

  const transcripts = (data ?? []) as TranscriptRow[];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex items-center justify-center flex-col gap-8">
      <Header content={"Transcripts"} className="text-3xl font-bold mb-8" />

      <Card className="w-[70vw]">
        <CardHeader>
          <CardTitle>Recent Transcripts</CardTitle>
          <CardDescription>
            {error ? (
              <span className="text-red-600">Failed to load transcripts: {error.message}</span>
            ) : (
              <>A log of recent conversation transcripts.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Conversation</TableHead>
                <TableHead>Date &amp; Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transcripts.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/recordings/${t.id}`} className="hover:underline">
                      {t.id}
                    </Link>
                  </TableCell>
                  <TableCell title={t.conversation_text}>
                    <Link href={`/dashboard/recordings/${t.id}`} className="hover:underline">
                      {t.conversation_text?.length > 140
                        ? `${t.conversation_text.slice(0, 140)}…`
                        : t.conversation_text}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {transcripts.length === 0 && !error && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No transcripts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
