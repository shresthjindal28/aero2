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
  CardFooter, // 1. ADDED: CardFooter import
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Mic,
  StopCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
// 2. ADDED: Tab component imports
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MedicalEntities, OtherEntity } from "@/lib/types";
const CHUNKS_LENGTH = 10000;
import { socket } from "@/lib/socket";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// --- Helper functions (no change) ---
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
// --- End Helper functions ---

interface DifferentialDiagnosis {
  diagnosis: string;
  likelihood: string;
  reasoning: string;
  supporting_evidence: string;
}

interface DifferentialResponse {
  primary_suspected_diagnosis?: string;
  differential_diagnoses?: DifferentialDiagnosis[];
  additional_tests?: string[];
  red_flags?: string[];
}

function RecordPage() {
  // --- State and Refs (no change) ---
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [soapGen, setSoapGen] = useState(false);
  // const [differentials, setdifferentials] = useState<unknown>();
  const [differentials, setdifferentials] = useState<DifferentialResponse | null>(null);
  const [gettingSugg, setGettingSugg] = useState(false);

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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageOpen, setImageOpen] = useState(false);

  const micRef = useRef<MediaRecorder>(null);
  const { user } = useUser();
  const doctorName = user?.fullName || user?.firstName || user?.username || "Unknown";
  const doctorEmail = user?.primaryEmailAddress?.emailAddress || "Unknown";
  // --- End State and Refs ---

  // --- useEffect and Listeners (no change) ---
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
  // --- End useEffect and Listeners ---

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Header content={"Record Transcription"} className="text-3xl font-bold mb-8" />

      {/* --- Action Buttons (SOAP SDK & Image Upload) - No Change --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

        <Sheet open={imageOpen} onOpenChange={setImageOpen}>
          <SheetTrigger asChild>
            <Button
              size="lg"
              variant="secondary"
              className="w-full h-16 text-lg relative"
            >
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

      {/* --- Alerts (Error & Processing) - No Change --- */}
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

      {/* --- Record Audio Card - No Change --- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Record Audio</CardTitle>
          <CardDescription>
            Record a new conversation directly from your microphone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recording ? (
            <Button
              onClick={startRecording}
              size="lg"
              className="w-full h-16 text-lg text-white"
              variant={"default"}
            >
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

      {/* 3. MOVED: Transcription card is now here */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Transcription</CardTitle>
          <CardDescription>
            The transcribed text will appear below. You can also edit it manually before
            generating notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-60"
            placeholder="Your transcribed text will appear here..."
          />
        </CardContent>
      </Card>

      {/* 4. REFACTORED: Results section now uses Tabs */}
      {entities && !processing && (
        <>
          <Tabs defaultValue="summary" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Extracted Entities</TabsTrigger>
              <TabsTrigger value="soap">SOAP Note</TabsTrigger>
            </TabsList>

            {/* --- Tab 1: Extracted Entities --- */}
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Conversation Summary</CardTitle>
                  <CardDescription>
                    Entities extracted from the transcription.
                    {languageCode && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        Language: {languageCode}
                      </span>
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
                    <p>
                      {entities.symptoms?.length ? entities.symptoms.join(", ") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Medications</p>
                    <p>
                      {entities.medications?.length
                        ? entities.medications.join(", ")
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Diseases</p>
                    <p>
                      {entities.diseases?.length ? entities.diseases.join(", ") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground mb-2">Procedures</p>
                    <p>
                      {entities.procedures?.length ? entities.procedures.join(", ") : "—"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-muted-foreground mb-2">
                      Other Entities
                    </p>
                    <p>
                      {entities.other?.length
                        ? entities.other
                            .map(
                              (o) =>
                                `${o.word} (${o.type}${
                                  o.confidence !== undefined
                                    ? `, ${Math.round(o.confidence * 100)}%`
                                    : ""
                                })`
                            )
                            .join(", ")
                        : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* --- Tab 2: SOAP Note --- */}
            <TabsContent value="soap">
              <Card>
                <CardHeader>
                  <CardTitle>SOAP Note</CardTitle>
                  <CardDescription>
                    Generate a SOAP note from the transcription and optional image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {soapGenerating ? (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating SOAP notes…</span>
                    </div>
                  ) : soapError ? (
                    <p className="text-red-600">{soapError}</p>
                  ) : soapNotes ? (
                    <div className="space-y-4 text-sm">
                      {soapNotes.image_descriptions && (
                        <div>
                          <p className="font-medium text-muted-foreground">
                            Image Description
                          </p>
                          <p className="whitespace-pre-wrap">
                            {soapNotes.image_descriptions}
                          </p>
                        </div>
                      )}
                      {soapNotes.subjective && (
                        <div>
                          <p className="font-medium text-muted-foreground">Subjective</p>
                          <p className="whitespace-pre-wrap">{soapNotes.subjective}</p>
                        </div>
                      )}
                      {soapNotes.objective && (
                        <div>
                          <p className="font-medium text-muted-foreground">Objective</p>
                          <p className="whitespace-pre-wrap">{soapNotes.objective}</p>
                        </div>
                      )}
                      {soapNotes.assessment && (
                        <div>
                          <p className="font-medium text-muted-foreground">Assessment</p>
                          <p className="whitespace-pre-wrap">{soapNotes.assessment}</p>
                        </div>
                      )}
                      {soapNotes.plan && (
                        <div>
                          <p className="font-medium text-muted-foreground">Plan</p>
                          <p className="whitespace-pre-wrap">{soapNotes.plan}</p>
                        </div>
                      )}
                      {!soapNotes.subjective &&
                        !soapNotes.objective &&
                        !soapNotes.assessment &&
                        !soapNotes.plan && <p>—</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click &ldquo;Generate SOAP Notes&quot; to create a note from the
                      transcription.
                    </p>
                  )}
                </CardContent>
                {/* 5. MOVED: Generate button is now in the footer of its tab card */}

                <CardFooter className="flex gap-3 justify-end">
                  {!soapGen ? (
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
                          if (imageFile) {
                            fd.append("images", imageFile);
                          }
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
                            throw new Error(
                              (data && (data as { message?: string }).message) ||
                                `Request failed: ${res.status}`
                            );
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
                          setSoapGen(true);
                        } catch (e: unknown) {
                          console.error(e);
                          const msg =
                            e instanceof Error
                              ? e.message
                              : "Failed to generate SOAP notes.";
                          setSoapError(msg);
                        } finally {
                          setSoapGenerating(false);
                        }
                      }}
                      variant="secondary"
                      disabled={soapGenerating}
                    >
                      {soapGenerating ? "Generating..." : "Generate SOAP Notes"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={async () => {
                          setGettingSugg(true);
                          const res = await fetch(
                            process.env.NEXT_PUBLIC_DIFFERENTIAL_URL || "",
                            {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ soap_notes: soapNotes }),
                            }
                          );
                          const data: DifferentialResponse = await res.json();
                          if (!res.ok) {
                            throw new Error(
                              (data && (data as { message?: string }).message) ||
                                `Request failed: ${res.status}`
                            );
                          }
                          console.log(data);

                          setdifferentials(data);
                          setGettingSugg(false);
                        }}
                        variant="outline"
                        disabled={gettingSugg}
                      >
                        {gettingSugg ? "Generating..." : "Get Suggestions"}
                      </Button>
                      <Button variant={"outline"}>Give Feedback</Button>
                    </>
                  )}
                </CardFooter>
              </Card>
              {differentials && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>AI Suggestions</CardTitle>
                    <CardDescription>Based on your generated SOAP notes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {differentials.primary_suspected_diagnosis && (
                      <div>
                        <h4 className="text-sm font-medium">Primary suspected diagnosis</h4>
                        <p className="text-sm text-muted-foreground">
                          {differentials.primary_suspected_diagnosis}
                        </p>
                      </div>
                    )}

                    {Array.isArray(differentials.differential_diagnoses) &&
                      differentials.differential_diagnoses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium">Differential diagnoses</h4>
                          <div className="mt-2 space-y-3">
                            {differentials.differential_diagnoses.map((d, idx) => (
                              <div key={idx} className="rounded-md border p-3">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{d.diagnosis}</span>
                                  {d.likelihood && (
                                    <span className="text-xs text-muted-foreground">{d.likelihood}</span>
                                  )}
                                </div>
                                {d.reasoning && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Reasoning: {d.reasoning}
                                  </p>
                                )}
                                {d.supporting_evidence && (
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Evidence: {d.supporting_evidence}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {Array.isArray(differentials.additional_tests) &&
                      differentials.additional_tests.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium">Recommended tests</h4>
                          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                            {differentials.additional_tests.map((t, idx) => (
                              <li key={idx}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {Array.isArray(differentials.red_flags) &&
                      differentials.red_flags.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-red-600">Red flags</h4>
                          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                            {differentials.red_flags.map((r, idx) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
          
          {/* 6. MOVED: Download button is now a final action at the bottom */}
          <div className="flex justify-end">
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
                    doc.setFont("helvetica", "bold");
                    doc.text(label, 14, y);
                    doc.setFont("helvetica", "normal");
                    const lines = doc.splitTextToSize(value, 150); // Indent value
                    doc.text(lines, 30, y + 6);
                    y += (lines.length + 1) * 7; // Add spacing
                    if (y > 280) {
                      doc.addPage();
                      y = 20;
                    }
                  };

                  // Simplified pushLine for long text
                  const pushBlock = (label: string, value: string) => {
                    doc.setFont("helvetica", "bold");
                    doc.text(label, 14, y);
                    y += 7;
                    doc.setFont("helvetica", "normal");
                    const lines = doc.splitTextToSize(value, 180);
                    doc.text(lines, 14, y);
                    y += lines.length * 7 + 4; // Add spacing
                    if (y > 280) {
                      doc.addPage();
                      y = 20;
                    }
                  };

                  pushLine("Doctor Name", String(doctorName));
                  pushLine("Doctor Email", String(doctorEmail));
                  y += 5; // Section break

                  doc.line(14, y - 2, 196, y - 2); // horizontal line

                  pushLine("Language", languageCode || "Unknown");
                  pushLine(
                    "Symptoms",
                    entities.symptoms?.length ? entities.symptoms.join(", ") : "—"
                  );
                  pushLine(
                    "Medications",
                    entities.medications?.length ? entities.medications.join(", ") : "—"
                  );
                  pushLine(
                    "Diseases",
                    entities.diseases?.length ? entities.diseases.join(", ") : "—"
                  );
                  pushLine(
                    "Procedures",
                    entities.procedures?.length ? entities.procedures.join(", ") : "—"
                  );

                  const otherString = entities.other?.length
                    ? entities.other
                        .map(
                          (o) =>
                            `${o.word} (${o.type}${
                              o.confidence !== undefined
                                ? `, ${Math.round(o.confidence * 100)}%`
                                : ""
                            })`
                        )
                        .join(", ")
                    : "—";
                  pushLine("Other Entities", otherString);

                  y += 5;
                  doc.line(14, y - 2, 196, y - 2); // horizontal line

                  if (soapNotes) {
                    pushBlock("SOAP Subjective", soapNotes.subjective || "—");
                    pushBlock("SOAP Objective", soapNotes.objective || "—");
                    pushBlock("SOAP Assessment", soapNotes.assessment || "—");
                    pushBlock("SOAP Plan", soapNotes.plan || "—");
                  }

                  y += 5;
                  doc.line(14, y - 2, 196, y - 2); // horizontal line

                  pushBlock("Full Transcription", text || "—");

                  doc.save("prescription-summary.pdf");
                } catch (err) {
                  console.error("Failed to generate PDF", err);
                  setError("Failed to generate PDF.");
                }
              }}
              className="ml-2"
              size="lg"
            >
              Download Prescription (PDF)
            </Button>
          </div>
        </>
      )}

      {/* 7. REMOVED: Old monolithic card and transcription card are gone from here */}
    </div>
  );
}
export default dynamic(() => Promise.resolve(RecordPage), { ssr: false });
