"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateTripPage() {
  const router = useRouter();

  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [budget, setBudget] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (endDate < startDate) {
      setError("End date cannot be before start date.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destination,
          startDate,
          endDate,
          numberOfTravelers,
          budget: Number(budget),
        }),
      });

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        router.replace("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Unable to create trip. Please check your details.");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Plan a New Trip
        </h1>

        <p className="mt-2 text-gray-500">
          Enter your travel details to start planning your adventure.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="destination"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Destination
            </label>

            <input
              id="destination"
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Istanbul"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                required
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="travelers"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Number of Travelers
            </label>

            <input
              id="travelers"
              type="number"
              min="1"
              required
              value={numberOfTravelers}
              onChange={(e) =>
                setNumberOfTravelers(Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          <div>
            <label
              htmlFor="budget"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Total Budget
            </label>

            <input
              id="budget"
              type="number"
              min="0"
              step="0.01"
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Creating Trip..." : "Create Trip"}
          </button>
        </form>
      </div>
    </main>
  );
}