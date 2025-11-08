"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import * as React from "react";

interface SoapNote {
  id: number;
  patient_info: string;
  soap_content: string;
  generated_at: string;
  keywords_used: string | null;
  session_type?: string | null;
  created_at?: string | null;
}

function truncate(text: string | null | undefined, len = 60) {
  if (!text) return "-";
  return text.length > len ? text.slice(0, len) + "…" : text;
}

const SoapNotesPage = () => {
  const [notes, setNotes] = useState<SoapNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchAllNotes = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("soap_notes")
        .select("*")
        .order("generated_at", { ascending: false });

      if (error) {
        console.error("Error fetching SOAP notes:", error);
        setError(error.message);
      } else {
        setNotes((data || []) as SoapNote[]);
      }
      setLoading(false);
    };

    fetchAllNotes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-3 text-lg">Loading SOAP Notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <div className="text-center mt-4 p-4">
          <h2 className="text-2xl font-bold text-red-600">Failed to load notes</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-6">
      <Button variant="outline" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">SOAP Notes</CardTitle>
          <CardDescription>Listing all notes from the database</CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">No notes found.</p>
          ) : (
            <Table>
              <TableCaption>Total notes: {notes.length}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient Info</TableHead>
                  <TableHead>Generated At</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notes.map((n) => (
                  <React.Fragment key={n.id}>
                    <TableRow>
                      <TableCell className="font-medium">{n.id}</TableCell>
                      <TableCell title={n.patient_info}>{truncate(n.patient_info, 50)}</TableCell>
                      <TableCell>
                        {n.generated_at ? new Date(n.generated_at).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell title={n.keywords_used || undefined}>
                        {truncate(n.keywords_used, 40)}
                      </TableCell>
                      <TableCell>{n.session_type || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExpanded((prev) => ({ ...prev, [n.id]: !prev[n.id] }))
                          }
                        >
                          <ChevronDown
                            className={`mr-2 h-4 w-4 transition-transform ${
                              expanded[n.id] ? "rotate-180" : ""
                            }`}
                          />
                          {expanded[n.id] ? "Hide" : "View"} details
                        </Button>
                      </TableCell>
                    </TableRow>
                    {expanded[n.id] && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="space-y-3 bg-secondary/40 p-4 rounded-md">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground">Created At</p>
                                <p className="text-sm">
                                  {n.created_at ? new Date(n.created_at).toLocaleString() : "-"}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Keywords Used</p>
                                <p className="text-sm">{n.keywords_used || "-"}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm font-semibold mb-2">Full SOAP Content</p>
                              <pre className="whitespace-pre-wrap font-sans bg-secondary/60 p-4 rounded text-sm leading-relaxed">
                                {n.soap_content}
                              </pre>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SoapNotesPage;