"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  budget: number;
};

type TripForm = {
  destination: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: string;
  budget: string;
};

const API_URL = "http://localhost:8080";

function TripDetailsContent() {
  const router = useRouter();
  const params = useParams();

  const tripId = params.tripId as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState<TripForm>({
    destination: "",
    startDate: "",
    endDate: "",
    numberOfTravelers: "1",
    budget: "",
  });

  function populateForm(selectedTrip: Trip) {
    setForm({
      destination: selectedTrip.destination,
      startDate: selectedTrip.startDate,
      endDate: selectedTrip.endDate,
      numberOfTravelers: String(selectedTrip.numberOfTravelers),
      budget: String(selectedTrip.budget),
    });
  }

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    async function loadTrip() {
      try {
        const response = await fetch(`${API_URL}/api/trips`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          sessionStorage.removeItem("token");
          router.replace("/");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load trip");
        }

        const trips: Trip[] = await response.json();

        const selectedTrip = trips.find(
          (item) => item.id === Number(tripId)
        );

        if (!selectedTrip) {
          throw new Error("Trip not found");
        }

        setTrip(selectedTrip);
        populateForm(selectedTrip);
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

    loadTrip();
  }, [tripId, router]);

  function startEditing() {
    if (!trip) return;

    populateForm(trip);
    setError("");
    setSuccess("");
    setIsEditing(true);
  }

  function cancelEditing() {
    if (trip) {
      populateForm(trip);
    }

    setIsEditing(false);
    setError("");
  }

  function updateForm(field: keyof TripForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!trip) return;

    setError("");
    setSuccess("");

    const destination = form.destination.trim();
    const travelers = Number(form.numberOfTravelers);
    const budget = Number(form.budget);

    if (!destination) {
      setError("Destination is required.");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Both travel dates are required.");
      return;
    }

    if (form.endDate < form.startDate) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    if (!Number.isInteger(travelers) || travelers < 1) {
      setError("Number of travelers must be at least 1.");
      return;
    }

    if (
      form.budget.trim() === "" ||
      !Number.isFinite(budget) ||
      budget <= 0
    ) {
      setError("Budget must be greater than zero.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/api/trips/${tripId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            destination,
            startDate: form.startDate,
            endDate: form.endDate,
            numberOfTravelers: travelers,
            budget,
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
        throw new Error(message || "Unable to update trip.");
      }

      // Some APIs return the updated trip; others return no body.
      // Reload the authenticated user's trips to verify persistence.
      const reloadResponse = await fetch(
        `${API_URL}/api/trips`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (reloadResponse.status === 401) {
        sessionStorage.removeItem("token");
        router.replace("/");
        return;
      }

      if (!reloadResponse.ok) {
        throw new Error(
          "Trip was updated, but its latest details could not be loaded."
        );
      }

      const trips: Trip[] = await reloadResponse.json();

      const updatedTrip = trips.find(
        (item) => item.id === Number(tripId)
      );

      if (!updatedTrip) {
        throw new Error("Updated trip could not be found.");
      }

      setTrip(updatedTrip);
      populateForm(updatedTrip);
      setIsEditing(false);
      setSuccess("Trip updated successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!trip) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete your trip to ${trip.destination}?\n\n` +
      "This action cannot be undone. Any associated itinerary may also be deleted."
    );

    if (!confirmed) return;

    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    setDeleting(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/trips/${tripId}`,
        {
          method: "DELETE",
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
        throw new Error(message || "Unable to delete trip.");
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete trip."
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading trip details...</p>
      </main>
    );
  }

  if (!trip) {
    return (
      <main className="p-10">
        <p className="text-red-600">
          {error || "Trip not found"}
        </p>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-5 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">

        <button
          onClick={() => router.push("/dashboard")}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? "Edit Trip" : trip.destination}
        </h1>

        <p className="mt-2 text-gray-500">
          {isEditing
            ? "Update your travel details."
            : "Your Travel Plan"}
        </p>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </p>
        )}

        {isEditing ? (
          <form
            onSubmit={handleSave}
            className="mt-8 space-y-5"
          >
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
                value={form.destination}
                onChange={(e) =>
                  updateForm("destination", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

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
                value={form.startDate}
                onChange={(e) =>
                  updateForm("startDate", e.target.value)
                }
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
                min={form.startDate || undefined}
                value={form.endDate}
                onChange={(e) =>
                  updateForm("endDate", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />
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
                step="1"
                required
                value={form.numberOfTravelers}
                onChange={(e) =>
                  updateForm("numberOfTravelers", e.target.value)
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
                min="0.01"
                step="0.01"
                required
                value={form.budget}
                onChange={(e) =>
                  updateForm("budget", e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={cancelEditing}
                disabled={saving}
                className="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-800 hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">

              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  Start Date
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {trip.startDate}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  End Date
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {trip.endDate}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  Travelers
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {trip.numberOfTravelers}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-5">
                <p className="text-sm text-gray-500">
                  Total Budget
                </p>
                <p className="mt-2 font-semibold text-gray-900">
                  {trip.budget}
                </p>
              </div>

            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={startEditing}
                className="rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600"
              >
                Edit Trip
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Trip"}
              </button>
            </div>

            <div className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                AI-Powered Itinerary
              </h2>

              <p className="mt-2 text-gray-600">
                Generate a personalized travel itinerary based on your
                destination, dates, budget, and preferences.
              </p>

              <button
                onClick={() =>
                  router.push(`/trips/${tripId}/itinerary`)
                }
                className="mt-5 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              >
                View / Generate Itinerary
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function TripDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading trip details...</p>
        </div>
      }
    >
      <TripDetailsContent />
    </Suspense>
  );
}