"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TravelPreferences = {
  travelStyle: string;
  preferredActivities: string;
  budgetPerDay: number;
  numberOfTravelers: number;
};

const API_URL = "http://localhost:8080";

export default function PreferencesPage() {
  const router = useRouter();

  const [travelStyle, setTravelStyle] = useState("Adventure");
  const [preferredActivities, setPreferredActivities] = useState("");
  const [budgetPerDay, setBudgetPerDay] = useState("");
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);

  const [preferencesExist, setPreferencesExist] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadPreferences() {
      const token = sessionStorage.getItem("token");

      if (!token) {
        router.replace("/");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/travel-preferences`,
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
          setPreferencesExist(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load travel preferences");
        }

        const data: TravelPreferences = await response.json();

        setTravelStyle(data.travelStyle);
        setPreferredActivities(data.preferredActivities);
        setBudgetPerDay(String(data.budgetPerDay));
        setNumberOfTravelers(data.numberOfTravelers);

        setPreferencesExist(true);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load preferences"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [router]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/travel-preferences`,
        {
          method: preferencesExist ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            travelStyle,
            preferredActivities,
            budgetPerDay: Number(budgetPerDay),
            numberOfTravelers,
          }),
        }
      );

      if (response.status === 401) {
        sessionStorage.removeItem("token");
        router.replace("/");
        return;
      }

      if (!response.ok) {
        const message = await response.text();

        throw new Error(message || "Unable to save preferences");
      }

      setPreferencesExist(true);
      setSuccess("Travel preferences saved successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save preferences"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading preferences...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-md">

        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Travel Preferences
        </h1>

        <p className="mt-2 text-gray-500">
          Personalize your AI-generated travel itineraries.
        </p>

        <form onSubmit={handleSave} className="mt-8 space-y-5">

          {/* Travel Style */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Travel Style
            </label>

            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            >
              <option value="Adventure">Adventure</option>
              <option value="Luxury">Luxury</option>
              <option value="Budget">Budget</option>
              <option value="Family">Family</option>
              <option value="Cultural">Cultural</option>
              <option value="Relaxation">Relaxation</option>
            </select>
          </div>

          {/* Preferred Activities */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Preferred Activities
            </label>

            <textarea
              required
              value={preferredActivities}
              onChange={(e) => setPreferredActivities(e.target.value)}
              rows={3}
              placeholder="e.g. Sightseeing, Local Food, Shopping, Museums"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Budget Per Day
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={budgetPerDay}
              onChange={(e) => setBudgetPerDay(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
            />
          </div>

          {/* Travelers */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Number of Travelers
            </label>

            <input
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

          {error && (
            <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </button>

        </form>
      </div>
    </main>
  );
}