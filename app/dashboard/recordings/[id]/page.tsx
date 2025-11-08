import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);

  const { data, error } = await supabase
    .from("transcripts")
    .select("*")
    .eq("id", idNum)
    .single();

  const notFound = !data && !error;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 flex items-center justify-center flex-col gap-6">
      <div className="w-full flex items-center justify-between">
        <Header content={`Transcript #${id}`} className="text-3xl font-bold" />
        <Link href="/dashboard/recordings" className="text-sm text-primary hover:underline">← Back to Transcripts</Link>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Transcript Details</CardTitle>
          <CardDescription>
            {error ? (
              <span className="text-red-600">Failed to load transcript: {error.message}</span>
            ) : notFound ? (
              <>No transcript found for ID {id}.</>
            ) : (
              <>Full data for the selected transcript.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">ID</div>
                  <div className="font-medium">{String(data.id)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Created At</div>
                  <div className="font-medium">{data.created_at ? new Date(String(data.created_at)).toLocaleString() : "—"}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground mb-2">Conversation Text</div>
                <div className="rounded-md border bg-muted p-3 text-sm whitespace-pre-wrap">
                  {data.conversation_text || "—"}
                </div>
              </div>

              {/* Render any other fields dynamically */}
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Additional Fields</div>
                <div className="rounded-md border p-3 text-sm">
                  {Object.entries(data)
                    .filter(([key]) => key !== "id" && key !== "created_at" && key !== "conversation_text")
                    .length === 0 ? (
                      <div className="text-muted-foreground">No additional fields.</div>
                    ) : (
                      <ul className="space-y-2">
                        {Object.entries(data)
                          .filter(([key]) => key !== "id" && key !== "created_at" && key !== "conversation_text")
                          .map(([key, value]) => (
                            <li key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">{key}</span>
                              <span className="md:col-span-2 break-words">
                                {typeof value === "object" ? (
                                  <pre className="whitespace-pre-wrap break-words">{JSON.stringify(value, null, 2)}</pre>
                                ) : (
                                  String(value ?? "—")
                                )}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}