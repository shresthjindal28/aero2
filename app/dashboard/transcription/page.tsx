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
import {
  Mic,
  StopCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon, // 1. Added Image Icon import
} from "lucide-react";
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
import dynamic from "next/dynamic";

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

export function RecordPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [entities, setEntities] = useState<MedicalEntities | null>(null);
  const [soapOpen, setSoapOpen] = useState(false);
  const [soapNote, setSoapNote] = useState("");
  const [soapGenerating, setSoapGenerating] = useState(false);
  const [soapError, setSoapError] = useState<string | null>(null);
  const [soapNotes, setSoapNotes] = useState<{
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    image_descriptions?: string;
  } | null>(null);

  // 2. Added state for image file and sheet
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageOpen, setImageOpen] = useState(false);

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

      {/* 3. Changed to a grid layout for both buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* --- SOAP Note Button/Sheet --- */}
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

        {/* 4. --- New Image Upload Button/Sheet --- */}
        <Sheet open={imageOpen} onOpenChange={setImageOpen}>
          <SheetTrigger asChild>
            <Button size="lg" variant="secondary" className="w-full h-16 text-lg relative">
              <ImageIcon className="mr-2 h-5 w-5" />
              Upload Image (optional)
              {imageFile && (
                <span className="absolute top-1 right-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  {imageFile.name.length > 10
                    ? `${imageFile.name.substring(0, 10)}...`
                    : imageFile.name}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Upload Image</SheetTitle>
              <SheetDescription>
                Upload an optional image to accompany the transcription.
              </SheetDescription>
            </SheetHeader>
            <div className="p-4 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (file) {
                    setImageOpen(false); // Auto-close on selection
                  }
                }}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
              {imageFile && (
                <div className="text-sm text-green-600">
                  Selected: <strong>{imageFile.name}</strong>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setImageOpen(false)}>
                  Close
                </Button>
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
            <div className="md:col-span-2">
              <p className="font-medium text-muted-foreground mb-2">SOAP Notes</p>
              {soapGenerating ? (
                <p className="text-muted-foreground">Generating SOAP notes…</p>
              ) : soapError ? (
                <p className="text-red-600">{soapError}</p>
              ) : soapNotes ? (
                <div className="space-y-2">
                  {soapNotes.image_descriptions && (
                    <div>
                      <p className="font-medium text-muted-foreground">Image Description</p>
                      <p>{soapNotes.image_descriptions}</p>
                    </div>
                  )}
                  {soapNotes.subjective && (
                    <div>
                      <p className="font-medium text-muted-foreground">Subjective</p>
                      <p>{soapNotes.subjective}</p>
                    </div>
                  )}
                  {soapNotes.objective && (
                    <div>
                      <p className="font-medium text-muted-foreground">Objective</p>
                      <p>{soapNotes.objective}</p>
                    </div>
                  )}
                  {soapNotes.assessment && (
                    <div>
                      <p className="font-medium text-muted-foreground">Assessment</p>
                      <p>{soapNotes.assessment}</p>
                    </div>
                  )}
                  {soapNotes.plan && (
                    <div>
                      <p className="font-medium text-muted-foreground">Plan</p>
                      <p>{soapNotes.plan}</p>
                    </div>
                  )}
                  {!soapNotes.subjective && !soapNotes.objective && !soapNotes.assessment && !soapNotes.plan && (
                    <p>—</p>
                  )}
                </div>
              ) : (
                <p>—</p>
              )}
            </div>
          </CardContent>
          <div className="p-4 border-t flex justify-end">
            <Button
              onClick={async () => {
                setSoapError(null);
                if (!text?.trim()) {
                  setSoapError("No transcription text available.");
                  return;
                }
                setSoapGenerating(true);
                try {
                  const fd = new FormData();
                  fd.append("conversation_text", text);
                  
                  // 5. --- MODIFICATION ---
                  // Add the image to the form data if it exists
                  if (imageFile) {
                    fd.append("image", imageFile);
                  }
                  // --- END MODIFICATION ---

                  const llmUrl = process.env.NEXT_PUBLIC_LLM_URL;
                  if (!llmUrl) {
                    throw new Error("NEXT_PUBLIC_LLM_URL is not configured");
                  }
                  const res = await fetch(llmUrl, {
                    method: "POST",
                    body: fd,
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    throw new Error((data && (data as { message?: string }).message) || `Request failed: ${res.status}`);
                  }
                  const out = data as {
                    image_descriptions?: string;
                    soap_notes?: {
                      subjective?: string;
                      objective?: string;
                      assessment?: string;
                      plan?: string;
                    };
                    status?: string;
                  };
                  setSoapNotes({
                    image_descriptions: out.image_descriptions,
                    subjective: out.soap_notes?.subjective,
                    objective: out.soap_notes?.objective,
                    assessment: out.soap_notes?.assessment,
                    plan: out.soap_notes?.plan,
                  });
                } catch (e: unknown) {
                  console.error(e);
                  const msg = e instanceof Error ? e.message : "Failed to generate SOAP notes.";
                  setSoapError(msg);
                } finally {
                  setSoapGenerating(false);
                }
              }}
              variant="secondary"
            >
              Generate SOAP Notes
            </Button>
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

                  if (soapNotes) {
                    pushLine("SOAP Subjective", soapNotes.subjective || "—");
                    pushLine("SOAP Objective", soapNotes.objective || "—");
                    pushLine("SOAP Assessment", soapNotes.assessment || "—");
                    pushLine("SOAP Plan", soapNotes.plan || "—");
                  }

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
export default dynamic(() => Promise.resolve(RecordPage), { ssr: false });