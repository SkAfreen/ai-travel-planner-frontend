"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type ItineraryDay = {
  id?: number;
  dayNumber: number;
  title: string;
  activitiesDescription: string;
};

type Itinerary = {
  id?: number;
  title: string;
  description?: string | null;
  days?: ItineraryDay[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function ItineraryContent() {
  const router = useRouter();
  const params = useParams();

  const tripId = params.tripId as string;

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [days, setDays] = useState<ItineraryDay[]>([]);

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadItinerary() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/trips/${tripId}/itinerary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          sessionStorage.removeItem("token");
          router.replace("/");
          return;
        }

        if (response.status === 404) {
          // This trip does not have an itinerary yet.
          setItinerary(null);
          setDays([]);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load itinerary");
        }

        const data: Itinerary = await response.json();

        setItinerary(data);

        // Some API responses include days directly.
        // Otherwise, fetch them from the days endpoint.
        if (Array.isArray(data.days)) {
          setDays(data.days);
        } else {
          const daysResponse = await fetch(
            `${API_URL}/api/trips/${tripId}/itinerary/days`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!daysResponse.ok) {
            throw new Error("Unable to load itinerary days");
          }

          const daysData: ItineraryDay[] =
            await daysResponse.json();

          setDays(daysData);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    loadItinerary();
  }, [tripId, router]);

  async function handleGenerate() {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/ai/trips/${tripId}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        router.replace("/");
        return;
      }

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "AI itinerary generation failed"
        );
      }

      // Fetch the saved itinerary after generation.
      const itineraryResponse = await fetch(
        `${API_URL}/api/trips/${tripId}/itinerary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!itineraryResponse.ok) {
        throw new Error("Unable to retrieve generated itinerary");
      }

      const itineraryData: Itinerary =
        await itineraryResponse.json();

      setItinerary(itineraryData);

      const daysResponse = await fetch(
        `${API_URL}/api/trips/${tripId}/itinerary/days`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!daysResponse.ok) {
        throw new Error("Unable to retrieve generated days");
      }

      const daysData: ItineraryDay[] =
        await daysResponse.json();

      setDays(daysData);

      setSuccess("AI itinerary generated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "AI itinerary generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading itinerary...</p>
      </main>
    );
  }

  function startEditing(day: ItineraryDay) {
  if (day.id == null) {
    setError("This itinerary day cannot be edited.");
    return;
  }

  setEditingDayId(day.id);
  setEditTitle(day.title);
  setEditDescription(day.activitiesDescription);
  setError("");
}

function cancelEditing() {
  setEditingDayId(null);
  setEditTitle("");
  setEditDescription("");
}

async function saveDay(day: ItineraryDay) {
  if (day.id == null) {
    setError("Invalid itinerary day.");
    return;
  }

  if (!editTitle.trim() || !editDescription.trim()) {
    setError("Title and activities description are required.");
    return;
  }

  const token = sessionStorage.getItem("token");

  if (!token) {
    router.replace("/");
    return;
  }

  setSaving(true);
  setError("");

  try {
    const response = await fetch(
      `${API_URL}/api/trips/${tripId}/itinerary/days/${day.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dayNumber: day.dayNumber,
          title: editTitle.trim(),
          activitiesDescription: editDescription.trim(),
        }),
      }
    );

    if (response.status === 401) {
      sessionStorage.removeItem("token");
      router.replace("/");
      return;
    }

    if (!response.ok) {
      throw new Error("Unable to update itinerary day.");
    }

    const updatedDay: ItineraryDay = await response.json();

    setDays((previousDays) =>
      previousDays.map((item) =>
        item.id === day.id ? updatedDay : item
        )
    );

    cancelEditing();
    setSuccess("Itinerary day updated successfully!");
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Unable to save changes."
    );
  } finally {
    setSaving(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-4xl">

        <button
          onClick={() => router.push(`/trips/${tripId}`)}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Trip
        </button>

        <div className="rounded-2xl bg-white p-8 shadow-sm">

          <h1 className="text-3xl font-bold text-gray-900">
            AI Travel Itinerary
          </h1>

          <p className="mt-2 text-gray-500">
            Your personalized day-by-day travel plan.
          </p>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generating
              ? "Generating your itinerary..."
              : itinerary
              ? "Regenerate AI Itinerary"
              : "Generate AI Itinerary"}
          </button>

          {generating && (
            <p className="mt-3 text-sm text-gray-500">
              AI generation may take a little time.
              Please wait...
            </p>
          )}

          {error && (
            <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">
              {success}
            </p>
          )}

        </div>

        {itinerary && (
          <section className="mt-8">

            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                {itinerary.title}
              </h2>

              {itinerary.description && (
                <p className="mt-3 text-gray-600">
                  {itinerary.description}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-5">
              {[...days]
                .sort((a, b) => a.dayNumber - b.dayNumber)
                .map((day) => (
                  <div
                    key={day.id ?? day.dayNumber}
                    className="rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                        Day {day.dayNumber}
                      </span>

                      <h3 className="text-xl font-semibold text-gray-900">
                        {day.title}
                      </h3>
                    </div>

                    {editingDayId === day.id ? (
  <div className="mt-5 space-y-4">
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Day Title
      </label>

      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
      />
    </div>

    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        Activities
      </label>

      <textarea
        value={editDescription}
        onChange={(e) => setEditDescription(e.target.value)}
        rows={6}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
      />
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => saveDay(day)}
        disabled={saving}
        className="rounded-lg bg-green-600 px-5 py-2 text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button
        onClick={cancelEditing}
        disabled={saving}
        className="rounded-lg bg-gray-200 px-5 py-2 text-gray-800"
      >
        Cancel
      </button>
    </div>
  </div>
) : (
  <>
    <p className="whitespace-pre-line leading-7 text-gray-600">
      {day.activitiesDescription}
    </p>

    <button
      onClick={() => startEditing(day)}
      className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
    >
      ✏️ Edit Day
    </button>
  </>
)}
                  </div>
                ))}
            </div>

            {days.length === 0 && (
              <p className="mt-6 text-gray-500">
                No itinerary days found.
              </p>
            )}

          </section>
        )}

        {!itinerary && !error && (
          <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              No Itinerary Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Click Generate AI Itinerary to create your
              personalized travel plan.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<p>Loading itinerary...</p>}>
      <ItineraryContent />
    </Suspense>
  );
}