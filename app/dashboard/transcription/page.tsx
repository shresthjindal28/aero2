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

import { processAudioFile } from "@/lib/api";
import { MedicalEntities } from "@/lib/types";
// jsPDF will be dynamically imported when needed to avoid SSR issues

type MRWithMime = MediaRecorder & { mimeType?: string };
const CHUNKS_LENGTH = 10000;
import { socket } from "@/lib/socket";

export default function RecordPage() {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [entities, setEntities] = useState<MedicalEntities | null>(null);
  const [soapOpen, setSoapOpen] = useState(false);
  const [soapNote, setSoapNote] = useState("");

  // const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // const audioChunksRef = useRef<Blob[]>([]);
  // const streamRef = useRef<MediaStream | null>(null);

  const micRef = useRef<MediaRecorder>(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
      // toast("connected");
    });
    return () => {
      socket.off("connect");
      if (micRef.current) {
        micRef.current.removeEventListener("dataavailable", micDataListner);
        micRef.current.removeEventListener("stop", micStopListner);
      }
    };
  }, []);

  // const startRecording = async () => {
  //   if (recording || processing) return;
  //   setError(null);
  //   setText("");
  //   setEntities(null);
  //   setLanguageCode(null);
  //   try {
  //     streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to access microphone. Please check browser permissions.");
  //     return;
  //   }

  //   audioChunksRef.current = [];
  //   const mimeType = "audio/webm";

  //   const recorder = new MediaRecorder(streamRef.current!, { mimeType });

  //   recorder.ondataavailable = (e: BlobEvent) => {
  //     if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
  //   };

  //   recorder.onerror = () => {
  //     setError("Recording error occurred.");
  //     setRecording(false);
  //   };

  //   try {
  //     recorder.start();
  //   } catch (err) {
  //     console.error(err);
  //     setError("Failed to start recording.");
  //     return;
  //   }

  //   mediaRecorderRef.current = recorder;
  //   setRecording(true);
  // };

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
      // should have added timeslice here. Without timeslice, the audio will be captured in a single chunks
      // for now 10s chunks are sent to backend
      mic.start(CHUNKS_LENGTH);
      mic.addEventListener("dataavailable", micDataListner);
      mic.addEventListener("stop", micStopListner);
    } catch (error) {
      setRecording(false);
      console.log(error);
    }
  };

  // const stopRecording = async () => {
  //   const mr = mediaRecorderRef.current;
  //   if (!mr || mr.state !== "recording") return;

  //   mr.onstop = async () => {
  //     const chunks = audioChunksRef.current.slice();
  //     audioChunksRef.current = [];

  //     if (streamRef.current) {
  //       streamRef.current.getTracks().forEach((t) => t.stop());
  //       streamRef.current = null;
  //     }
  //     mediaRecorderRef.current = null;

  //     if (!chunks.length) {
  //       setError("No audio captured.");
  //       setRecording(false);
  //       return;
  //     }

  //     const blobType = (mr as MRWithMime).mimeType || "audio/webm";
  //     const blob = new Blob(chunks, { type: blobType });
  //     const file = new File([blob], `recording.webm`, { type: blob.type });

  //     setProcessing(true);
  //     setError(null);

  //     try {
  //       const data = await processAudioFile(file);

  //       setText(data?.transcription?.text || "");
  //       setLanguageCode(data?.transcription?.language_code || null);
  //       setEntities(data?.medical_entities || null);
  //     } catch (err) {
  //       console.error(err);
  //       setError(err instanceof Error ? err.message : String(err));
  //       setText("");
  //       setEntities(null);
  //     } finally {
  //       setProcessing(false);
  //     }
  //   };

  //   try {
  //     mr.stop();
  //   } catch (err) {
  //     console.error("Error stopping recorder:", err);
  //   }

  //   setRecording(false);
  // };

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
          <CardDescription>
            Record a new conversation directly from your microphone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recording ? (
            <Button
              onClick={startRecording}
              // disabled={processing}
              size="lg"
              className="w-full h-16 text-lg text-white"
              variant={"default"}
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <Button
              // onClick={stopRecording}
              onClick={() => {
                console.log("stopped");
                setRecording(false);
                if (micRef.current) {
                  micRef.current.stop();
                }
              }}
              // disabled={processing}
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
            <CardTitle>Prescription Summary</CardTitle>
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
            <div>
              <p className="font-medium text-muted-foreground mb-2">Symptoms</p>
              <p>{entities.symptoms?.length ? entities.symptoms.join(", ") : "—"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Medications</p>
              <p>
                {entities.medications?.length ? entities.medications.join(", ") : "—"}
              </p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Diseases</p>
              <p>{entities.diseases?.length ? entities.diseases.join(", ") : "—"}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground mb-2">Procedures</p>
              <p>{entities.procedures?.length ? entities.procedures.join(", ") : "—"}</p>
            </div>
          </CardContent>
          <div className="p-4 border-t flex justify-end">
            <Button
              onClick={async () => {
                // build a simple PDF with the prescription summary
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
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="h-80"
            placeholder="Your transcribed text will appear here..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
