"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Trip = {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  budget: number;
};

export default function Dashboard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    async function loadDashboard() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Verify authentication
        const profileResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/profile`,
          { headers }
        );

        if (!profileResponse.ok) {
          throw new Error("Authentication failed");
        }

        const message = await profileResponse.text();

        const match = message.match(
          /Hello (.*), you are authenticated!/
        );

        setEmail(match ? match[1] : "Traveler");

        // Fetch saved trips
        const tripsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/trips`,
          { headers }
        );

        if (tripsResponse.status === 401) {
          throw new Error("Authentication failed");
        }

        if (!tripsResponse.ok) {
          throw new Error("Unable to load trips");
        }

        const tripsData: Trip[] = await tripsResponse.json();

        setTrips(tripsData);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";

        if (message === "Authentication failed") {
          sessionStorage.removeItem("token");
          router.replace("/");
          return;
        }

        setError(message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    sessionStorage.removeItem("token");
    router.replace("/");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading your trips...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Header */}
      <header className="flex items-center justify-between bg-white px-8 py-5 shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">
          AI Travel Planner
        </h1>

        <button
          onClick={() => router.push("/preferences")}
          className="rounded-lg bg-blue-50 px-5 py-2 font-medium text-blue-700 hover:bg-blue-100"
>
          Travel Preferences
        </button>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-12">

        <h2 className="text-3xl font-bold text-gray-800">
          Welcome to Your Dashboard!
        </h2>

        <p className="mt-3 text-gray-600">
          Logged in as: {email}
        </p>

        {/* Trips Section */}
        <div className="mt-10">

          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-gray-800">
              My Trips
            </h3>

            <button
              onClick={() => router.push("/trips/new")}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              + Create Trip
            </button>
          </div>

          {error && (
            <p className="mb-5 rounded-lg bg-red-50 p-4 text-red-600">
              {error}
            </p>
          )}

          {!error && trips.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
              <p className="text-gray-500">
                No trips found. Create your first trip!
              </p>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <div
                key={trip.id}
                className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <h4 className="text-xl font-bold text-gray-800">
                  {trip.destination}
                </h4>

                <p className="mt-3 text-sm text-gray-600">
                  📅 {trip.startDate} to {trip.endDate}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  👥 {trip.numberOfTravelers} Travelers
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  💰 Budget: {trip.budget}
                </p>

                <button
                  onClick={() => router.push(`/trips/${trip.id}`)}
                  className="mt-6 w-full rounded-lg bg-blue-50 py-3 font-medium text-blue-700 hover:bg-blue-100"
                >
                  View Trip
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  );
}