"use client";
import React, { useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mic, StopCircle, AlertTriangle, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MedicalEntities, OtherEntity } from "@/lib/types";
const CHUNKS_LENGTH = 10000;
import { socket } from "@/lib/socket";
import { useUser } from "@clerk/nextjs";


function norm(s: string): string {
  return s.trim().toLowerCase();
}
function mergeStringLists(prev?: string[], incoming?: string[]) {
  const result = [...(prev ?? [])];
  const set = new Set(result.map(norm));
  for (const x of incoming ?? []) {
    const nx = norm(x);
    if (!set.has(nx)) {
      result.push(x);
      set.add(nx);
    }
  }
  return result;
}
function mergeOtherEntities(prev?: OtherEntity[], incoming?: OtherEntity[]) {
  const map = new Map<string, OtherEntity>();
  for (const o of prev ?? []) {
    const key = `${norm(o.word)}|${norm(o.type)}`;
    map.set(key, o);
  }
  for (const o of incoming ?? []) {
    const key = `${norm(o.word)}|${norm(o.type)}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, o);
    } else {
      const confidence = Math.max(existing.confidence ?? 0, o.confidence ?? 0);
      map.set(key, { ...existing, confidence });
    }
  }
  return Array.from(map.values());
}
function mergeEntities(
  prev: MedicalEntities | null,
  incoming: MedicalEntities | null
): MedicalEntities | null {
  if (!incoming) return prev ?? null;
  if (!prev) return incoming;
  return {
    diseases: mergeStringLists(prev.diseases, incoming.diseases),
    medications: mergeStringLists(prev.medications, incoming.medications),
    symptoms: mergeStringLists(prev.symptoms, incoming.symptoms),
    procedures: mergeStringLists(prev.procedures, incoming.procedures),
    other: mergeOtherEntities(prev.other, incoming.other),
  };
}

export default function RecordPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [entities, setEntities] = useState<MedicalEntities | null>(null);
  const [soapOpen, setSoapOpen] = useState(false);
  const [soapNote, setSoapNote] = useState("");

  const micRef = useRef<MediaRecorder>(null);
  const { user } = useUser();
  const doctorName = user?.fullName || user?.firstName || user?.username || "Unknown";
  const doctorEmail = user?.primaryEmailAddress?.emailAddress || "Unknown";

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
    socket.on("transcripted-data", (data) => {
      console.log("transcripted-data", data);
      try {
        const t = data?.transcription?.text as string | undefined;
        const lc = (data?.transcription?.language_code as string | null) ?? null;
        const me = (data?.medical_entities as MedicalEntities | null) ?? null;

        if (typeof t === "string" && t.length) {
          setText((prev) => {
            if (!prev) return t;
            const nl = prev.endsWith("\n") ? "" : "\n";
            return prev + nl + t;
          });
        }

        setLanguageCode(lc);
        setEntities((prev) => mergeEntities(prev, me));
        setProcessing(false);
        setError(null);
      } catch (e) {
        console.error(e);
      }
    });
    return () => {
      socket.off("connect");
      socket.off("transcripted-data");
      if (micRef.current) {
        micRef.current.removeEventListener("dataavailable", micDataListner);
        micRef.current.removeEventListener("stop", micStopListner);
      }
    };
  }, []);

  const micDataListner = async (e: BlobEvent) => {
    console.log("streaming audio to backend..");
    socket.emit("audio-channel", await e.data.arrayBuffer());
  };
  const micStopListner = (e: Event) => {
    console.log("recording stopped");
    if (micRef.current) {
      micRef.current.stop();
    }
    socket.emit("audio-channel-commands", "stop");
  };

  const startRecording = async () => {
    setError(null);
    setText("");
    setEntities(null);
    setLanguageCode(null);
    setProcessing(true);

    socket.emit("audio-channel-commands", "start");
    console.log("rec starting...");

    setRecording(true);
    try {
      const userMedia = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      const mic = new MediaRecorder(userMedia);
      micRef.current = mic;
      mic.start(CHUNKS_LENGTH);
      mic.addEventListener("dataavailable", micDataListner);
      mic.addEventListener("stop", micStopListner);
    } catch (error) {
      setRecording(false);
      setProcessing(false);
      console.log(error);
      setError("Failed to access microphone. Please check browser permissions.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Header content={"Record Transcription"} className="text-3xl font-bold mb-8" />

      <div className="mb-6">
        <Sheet open={soapOpen} onOpenChange={setSoapOpen}>
          <SheetTrigger asChild>
            <Button size="lg" variant="secondary" className="w-full h-16 text-lg">
              RunAnywhere SDK (SOAP Note)
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>RunAnywhere SDK</SheetTitle>
              <SheetDescription>
                Enter your SOAP note below. Learn more at{" "}
                <a
                  href="https://github.com/RunanywhereAI/runanywhere-sdks"
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  GitHub
                </a>
                .
              </SheetDescription>
            </SheetHeader>
            <div className="p-4 space-y-4">
              <Textarea
                value={soapNote}
                onChange={(e) => setSoapNote(e.target.value)}
                placeholder="Enter your SOAP note..."
                className="h-48"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSoapOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => setSoapOpen(false)}>Save</Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {processing && (
        <Alert className="mb-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Processing Audio</AlertTitle>
          <AlertDescription>Connecting to Server, please wait...</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Record Audio</CardTitle>
          <CardDescription>Record a new conversation directly from your microphone.</CardDescription>
        </CardHeader>
        <CardContent>
          {!recording ? (
            <Button onClick={startRecording} size="lg" className="w-full h-16 text-lg text-white" variant={"default"}>
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={() => {
                console.log("stopped");
                setRecording(false);
                if (micRef.current) {
                  micRef.current.stop();
                }
              }}
              size="lg"
              variant="destructive"
              className="w-full h-16 text-lg"
            >
              <StopCircle className="mr-2 h-5 w-5" />
              Stop Recording
            </Button>
          )}
        </CardContent>
      </Card>

      {entities && !processing && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Conversation Summary</CardTitle>
            <CardDescription>
              Entities extracted from the transcription.
              {languageCode && (
                <span className="block text-xs text-muted-foreground mt-1">Language: {languageCode}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="md:col-span-2">
              <p className="font-medium text-muted-foreground mb-2">Doctor</p>
              <p>
                {String(doctorName)} ({String(doctorEmail)})
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Symptoms</p>
              <p>{entities.symptoms?.length ? entities.symptoms.join(", ") : "—"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Medications</p>
              <p>{entities.medications?.length ? entities.medications.join(", ") : "—"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Diseases</p>
              <p>{entities.diseases?.length ? entities.diseases.join(", ") : "—"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Procedures</p>
              <p>{entities.procedures?.length ? entities.procedures.join(", ") : "—"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="font-medium text-muted-foreground mb-2">Other Entities</p>
              <p>
                {entities.other?.length
                  ? entities.other
                      .map(
                        (o) =>
                          `${o.word} (${o.type}${
                            o.confidence !== undefined ? `, ${Math.round(o.confidence * 100)}%` : ""
                          })`
                      )
                      .join(", ")
                  : "—"}
              </p>
            </div>
          </CardContent>
          <div className="p-4 border-t flex justify-end">
            <Button
              onClick={async () => {
                try {
                  const { jsPDF } = await import("jspdf");
                  const doc = new jsPDF();
                  const title = "Prescription Summary";
                  doc.setFontSize(18);
                  doc.text(title, 14, 20);

                  doc.setFontSize(12);
                  let y = 34;

                  const pushLine = (label: string, value: string) => {
                    const lines = doc.splitTextToSize(`${label}: ${value}`, 180);
                    doc.text(lines, 14, y);
                    y += lines.length * 7;
                    if (y > 280) {
                      doc.addPage();
                      y = 20;
                    }
                  };

                  pushLine("Doctor Name", String(doctorName));
                  pushLine("Doctor Email", String(doctorEmail));

                  pushLine("Language", languageCode || "Unknown");
                  pushLine("Symptoms", entities.symptoms?.length ? entities.symptoms.join(", ") : "—");
                  pushLine("Medications", entities.medications?.length ? entities.medications.join(", ") : "—");
                  pushLine("Diseases", entities.diseases?.length ? entities.diseases.join(", ") : "—");
                  pushLine("Procedures", entities.procedures?.length ? entities.procedures.join(", ") : "—");

                  const otherString =
                    entities.other?.length
                      ? entities.other
                          .map(
                            (o) =>
                              `${o.word} (${o.type}${
                                o.confidence !== undefined ? `, ${Math.round(o.confidence * 100)}%` : ""
                              })`
                          )
                          .join(", ")
                      : "—";
                  pushLine("Other Entities", otherString);

                  pushLine("Transcription", text || "—");

                  doc.save("prescription-summary.pdf");
                } catch (err) {
                  console.error("Failed to generate PDF", err);
                  setError("Failed to generate PDF.");
                }
              }}
              className="ml-2"
            >
              Download Prescription (PDF)
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transcription</CardTitle>
          <CardDescription>The transcribed text will appear below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} className="h-80" placeholder="Your transcribed text will appear here..." />
        </CardContent>
      </Card>
    </div>
  );
}
