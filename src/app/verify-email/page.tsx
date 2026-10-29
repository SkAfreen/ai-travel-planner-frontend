"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";

type VerificationStatus = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(
          `${apiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Verification failed. Your link may be invalid, expired, or already used."
          );
        }

        setStatus("success");
        setMessage("Your email address has been verified successfully!");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred."
        );
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">

        <h1 className="mb-6 text-2xl font-bold text-slate-800">
          AI Travel Planner
        </h1>

        {status === "loading" && (
          <LoaderCircle className="mx-auto mb-5 h-14 w-14 animate-spin text-blue-600" />
        )}

        {status === "success" && (
          <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-green-600" />
        )}

        {status === "error" && (
          <CircleAlert className="mx-auto mb-5 h-14 w-14 text-red-500" />
        )}

        <h2 className="mb-3 text-xl font-semibold text-slate-800">
          {status === "loading"
            ? "Verifying Email"
            : status === "success"
            ? "Email Verified!"
            : "Verification Failed"}
        </h2>

        <p className="mb-6 text-slate-600">{message}</p>

        {status === "success" && (
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Continue to Login
          </button>
        )}

        {status === "error" && (
          <button
            onClick={() => router.push("/")}
            className="w-full rounded-lg bg-slate-800 px-4 py-3 font-semibold text-white hover:bg-slate-900"
          >
            Back to Login
          </button>
        )}

      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>Loading verification page...</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}