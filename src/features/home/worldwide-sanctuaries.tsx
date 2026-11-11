"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Sparkles,
} from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Unit } from "@/data/schema/content";
import {
  buildGoogleMapsUrl,
  calculateDistance,
  formatDistance,
  resolveCoordinates,
  type Coordinates,
} from "@/lib/geo";
import { routes } from "@/lib/routes";

export interface WorldwideSanctuariesProps {
  units?: Unit[];
  pageCount?: number;
  headquarters?: Unit[];
}

interface TerritoryCardConfig {
  id: string;
  title: string;
  image: string;
  filterFn: (unit: Unit) => boolean;
  defaultBranchLabel: (count: number) => string;
}

const TERRITORY_CARDS: TerritoryCardConfig[] = [
  {
    id: "nigeria",
    title: "Nigeria",
    image: "/brand/hero-mount-zion.webp",
    filterFn: (u) => u.country === "NG" || !u.country,
    defaultBranchLabel: (count) => `${count} Sanctuaries & Provinces`,
  },
  {
    id: "uk",
    title: "United Kingdom",
    image: "/media/legacy/2026/02/IMG_9769.jpg.webp",
    filterFn: (u) => u.country === "GB",
    defaultBranchLabel: (count) => `${count} Cathedral & Branches`,
  },
  {
    id: "usa",
    title: "United States of America (USA)",
    image: "/media/legacy/2026/02/IMG_9657.jpg.webp",
    filterFn: (u) => u.country === "US",
    defaultBranchLabel: (count) => `${count} Diocesan Parishes`,
  },
  {
    id: "canada",
    title: "Canada",
    image: "/media/legacy/2026/02/AT24.jpg.webp",
    filterFn: (u) => u.country === "CA",
    defaultBranchLabel: (count) => `${count} North America Assembly`,
  },
  {
    id: "headquarters",
    title: "Principal Headquarters",
    image: "/media/legacy/2026/02/AT107.jpg.webp",
    filterFn: (u) => u.kind === "headquarters",
    defaultBranchLabel: (count) => `${count} Consecrated Seats`,
  },
  {
    id: "maritime",
    title: "Rivers & Maritime Provinces",
    image: "/media/legacy/2026/02/AT18.jpg.webp",
    filterFn: (u) =>
      Boolean(
        (u.locality && /rivers|port harcourt|yenagoa|bayelsa|abonnema|andoni|opobo/i.test(u.locality)) ||
        /rivers|port harcourt|yenagoa|bayelsa/i.test(u.name),
      ),
    defaultBranchLabel: (count) => `${count} Coastal Parishes`,
  },
];

const POPULAR_SEARCH_CITIES = [
  "Lagos",
  "Port Harcourt",
  "Abuja",
  "Ibadan",
  "London",
  "United States",
  "Canada",
];

interface EnrichedUnit extends Unit {
  distanceKm?: number;
}

export function WorldwideSanctuaries({
  units = [],
  pageCount,
  headquarters = [],
}: WorldwideSanctuariesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Modal inspection states
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryCardConfig | null>(null);
  const [selectedChurch, setSelectedChurch] = useState<EnrichedUnit | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const activeUnits = useMemo(() => {
    return units.length > 0 ? units : headquarters;
  }, [units, headquarters]);

  const totalCount = pageCount ?? activeUnits.length;
  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());

  // Geolocation trigger: detects user GPS coordinates
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserLocation(coords);
        setIsLocating(false);
        setLocationStatus("Sorted by nearest distance to your location");
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("Location permission denied. You can filter or search by city below.");
        } else {
          setLocationStatus("Could not retrieve location. Please search by city name.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  // Compute live real-time metrics for each territory card directly from units
  const territoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const card of TERRITORY_CARDS) {
      counts[card.id] = activeUnits.filter(card.filterFn).length;
    }
    return counts;
  }, [activeUnits]);

  // Compute real-time distance to all units when location is activated
  const unitsWithDistance: EnrichedUnit[] = useMemo(() => {
    return activeUnits
      .map((u): EnrichedUnit => {
        if (!userLocation) return { ...u };
        const coords = resolveCoordinates(u.locality, u.name, u.country);
        const distanceKm = coords ? calculateDistance(userLocation, coords, "km") : undefined;
        return { ...u, distanceKm };
      })
      .sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
  }, [activeUnits, userLocation]);

  // Live search results
  const searchResults = useMemo(() => {
    if (!deferredSearch) return [];
    return unitsWithDistance.filter((u) => {
      const corpus = [u.name, u.locality, u.address, u.country].filter(Boolean).join(" ").toLowerCase();
      return corpus.includes(deferredSearch);
    });
  }, [unitsWithDistance, deferredSearch]);

  const handleCopyAddress = (address: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2200);
    }
  };

  // Territory active list for modal
  const territoryChurches = useMemo(() => {
    if (!selectedTerritory) return [];
    return unitsWithDistance.filter(selectedTerritory.filterFn);
  }, [unitsWithDistance, selectedTerritory]);

  return (
    <section
      id="worldwide-parish-directory"
      aria-labelledby="find-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-[#09090c] py-24 text-white sm:py-32 lg:py-36 dark:bg-[#07080a]"
    >
      {/* Ambient Seraphic Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%-18rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-crimson-800/40 via-gold-500/20 to-transparent opacity-25 sm:left-[calc(50%-30rem)] sm:w-288.75"
        />
      </div>

      <div className="mx-auto max-w-wide px-gutter">
        {/* Centered Editorial Header - faithfully styled to reference design */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-950/40 px-4 py-1.5 text-xs font-bold tracking-widest text-gold-300 uppercase shadow-xs backdrop-blur-md">
            <Globe className="size-3.5 text-gold-400" />
            <span>Worldwide Parish Directory · Est. 1925</span>
          </div>

          {/* High-Impact Centered Headline with Liturgical Accent */}
          <h2
            id="find-heading"
            className="mt-6 font-display text-[clamp(2.5rem,2.1rem+3vw,4.75rem)] leading-[1.05] font-extrabold tracking-tight text-balance text-white uppercase"
          >
            We Are A House Of Prayer <span className="font-black text-gold-400">In Every City</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-5 max-w-3xl text-base leading-relaxed font-normal text-neutral-300 sm:text-lg lg:text-xl">
            We are a worldwide family grounded in Scripture, centered on Christ, and walking in continuous
            apostolic prayer. Across {totalCount} churches, provincial secretariats, and prayer houses across
            Nigeria and the global diaspora — there is a house of prayer near you. Come worship with us.
          </p>

          {/* Central Actions (Matching reference pill button + Smart Geolocation) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={routes.find()}
              className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-neutral-700 bg-neutral-900/90 px-8 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:border-gold-500 hover:bg-neutral-800 hover:shadow-gold-500/10 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
            >
              <span>See All Branches</span>
              <Compass className="size-4 text-gold-400 transition-transform duration-300 group-hover:rotate-45" />
            </Link>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full border border-gold-500/40 bg-gold-500/10 px-7 text-sm font-bold text-gold-300 shadow-md transition-all duration-300 hover:border-gold-400 hover:bg-gold-500 hover:text-neutral-950 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none disabled:opacity-50"
            >
              {isLocating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Locating nearest sanctuaries...</span>
                </>
              ) : (
                <>
                  <Navigation className="size-4 text-gold-400 transition-transform duration-300 group-hover:rotate-45 group-hover:text-neutral-950" />
                  <span>Find Churches Near Me</span>
                </>
              )}
            </button>
          </div>

          {/* Geolocation feedback note */}
          {locationStatus && (
            <p className="mt-3 animate-fade-in text-xs font-semibold text-gold-300">{locationStatus}</p>
          )}
        </div>

        {/* Dynamic Display: If user activated GPS, show closest parishes; otherwise show the 6 Regional Cards */}
        {userLocation ? (
          <div className="mt-14">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="font-display text-xl font-bold text-white">Churches Nearest To You</h3>
                <p className="text-xs text-neutral-400">
                  Real-time distance calculated from your current device location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserLocation(null)}
                className="cursor-pointer text-xs font-bold text-gold-400 hover:underline"
              >
                Reset to All Regions
              </button>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
              {unitsWithDistance.slice(0, 6).map((church) => (
                <article
                  key={church.slug}
                  onClick={() => setSelectedChurch(church)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedChurch(church);
                    }
                  }}
                  className="group relative flex aspect-16/11 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-2xl hover:shadow-gold-500/10 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
                >
                  <Image
                    src={church.cover?.url || "/brand/hero-mount-zion.webp"}
                    alt={church.name}
                    fill
                    sizes="(min-width: 1280px) 400px, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-black/95 via-black/45 to-black/20"
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="rounded-full border border-gold-500/40 bg-neutral-950/80 px-3 py-1 text-[0.6875rem] font-bold tracking-wider text-gold-300 uppercase backdrop-blur-md">
                      {church.kind.replace("-", " ")}
                    </span>
                    {church.distanceKm !== undefined && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-black/80 px-3 py-1 text-[0.6875rem] font-bold text-emerald-300 backdrop-blur-md">
                        <Navigation className="size-3 text-emerald-400" />
                        {formatDistance(church.distanceKm)}
                      </span>
                    )}
                  </div>

                  <div className="relative z-10 text-white">
                    <h4 className="font-display text-2xl font-bold tracking-tight text-white group-hover:text-gold-200">
                      {church.name}
                    </h4>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-300">
                      <MapPin className="size-3.5 shrink-0 text-gold-400" />
                      <span>{church.locality || church.address || "Holy Order Parish"}</span>
                    </p>
                    <div className="mt-3 flex translate-y-2 transform items-center gap-1 text-xs font-bold text-gold-400 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span>View Directions & Details</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          /* The 6 Flagship Territory Cards (Exact match to reference design with live automated counts) */
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
            {TERRITORY_CARDS.map((card) => {
              const liveCount = territoryCounts[card.id] || 0;
              return (
                <article
                  key={card.id}
                  onClick={() => setSelectedTerritory(card)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedTerritory(card);
                    }
                  }}
                  aria-haspopup="dialog"
                  aria-label={`Explore ${card.title} sanctuaries`}
                  className="group relative flex aspect-16/11 cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-md transition-all duration-500 select-none hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-2xl hover:shadow-gold-500/10 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none sm:p-7"
                >
                  {/* Background Photography */}
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Gradient Shadow Overlay */}
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-linear-to-t from-black/95 via-black/45 to-transparent transition-opacity duration-300 group-hover:opacity-90"
                  />

                  {/* Top Arrow Icon */}
                  <div className="absolute top-5 right-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all duration-300 group-hover:border-gold-500/50 group-hover:bg-gold-500 group-hover:text-neutral-950">
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>

                  {/* Bottom Text Details: Bold Title & Branch Count */}
                  <div className="relative z-10 text-white">
                    <h3 className="font-display text-2xl leading-tight font-extrabold tracking-tight text-white transition-colors duration-200 group-hover:text-gold-200 sm:text-3xl">
                      {card.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-neutral-300">
                      {card.defaultBranchLabel(liveCount)}
                    </p>

                    {/* Micro Hover Cue */}
                    <div className="mt-3 flex translate-y-2 transform items-center gap-1 text-xs font-bold text-gold-400 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      <span>Explore Sanctuaries & Addresses</span>
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Bottom Search & Popular Discovery Band */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-neutral-950/80 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h3 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                Search our worldwide directory
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
                Filter across all {totalCount} churches, provincial secretariats, and prayer houses across
                Nigeria and the global diaspora.
              </p>
            </div>

            {/* Quick Search Form */}
            <form action={routes.find()} role="search" className="flex w-full max-w-md gap-2.5">
              <label htmlFor="find-band-q-input" className="sr-only">
                Town, province or church name
              </label>
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="find-band-q-input"
                  name="q"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city, province, or parish name..."
                  className="h-12 w-full rounded-full border border-white/20 bg-neutral-900 pr-4 pl-11 text-sm text-white outline-none placeholder:text-neutral-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-gold-500 px-7 text-sm font-bold text-neutral-950 shadow-md transition-all hover:bg-gold-400 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
              >
                Search
              </button>
            </form>
          </div>

          {/* Live Search Instant Dropdown Preview */}
          {searchResults.length > 0 && (
            <div className="mt-6 rounded-xl border border-white/10 bg-neutral-900 p-4">
              <p className="mb-3 text-xs font-bold tracking-wider text-gold-400 uppercase">
                Matching Sanctuaries ({searchResults.length}):
              </p>
              <div className="grid max-h-60 gap-2 overflow-y-auto pr-2 sm:grid-cols-2">
                {searchResults.slice(0, 8).map((match) => (
                  <button
                    key={match.slug}
                    type="button"
                    onClick={() => setSelectedChurch(match)}
                    className="flex cursor-pointer items-center justify-between rounded-lg bg-white/5 p-2 text-left transition-colors hover:bg-white/10"
                  >
                    <span className="truncate pr-2">
                      <strong className="block text-sm text-white">{match.name}</strong>
                      <span className="text-xs text-neutral-400">{match.locality || match.address}</span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-gold-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular City Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-5">
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              Popular Cities:
            </span>
            {POPULAR_SEARCH_CITIES.map((city) => (
              <Link
                key={city}
                href={routes.find({ q: city })}
                className="inline-flex min-h-7 items-center rounded-full border border-white/10 bg-white/5 px-3.5 text-xs font-semibold text-neutral-300 transition-colors hover:border-gold-500/50 hover:bg-gold-500/10 hover:text-gold-300"
              >
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Territory Dialog: Lists real churches in the clicked territory */}
      <Dialog
        open={selectedTerritory !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTerritory(null);
        }}
      >
        {selectedTerritory && (
          <DialogContent className="max-w-3xl overflow-hidden border border-white/15 bg-neutral-950 p-0 text-white shadow-2xl sm:rounded-2xl">
            <div className="relative aspect-16/8 w-full overflow-hidden bg-neutral-900">
              <Image
                src={selectedTerritory.image}
                alt={selectedTerritory.title}
                fill
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"
              />
              <div className="absolute bottom-5 left-6 z-10">
                <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">
                  Territory Directory
                </span>
                <h3 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
                  {selectedTerritory.title}
                </h3>
                <p className="text-xs text-neutral-300">
                  {territoryChurches.length} Active Parishes & Diocesan Secretariats
                </p>
              </div>
            </div>

            <div className="max-h-[60vh] space-y-4 overflow-y-auto p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2">
                {territoryChurches.map((church) => {
                  const locationString = church.address || church.locality || church.name;
                  return (
                    <div
                      key={church.slug}
                      className="flex flex-col justify-between rounded-xl border border-white/10 bg-neutral-900/80 p-4 transition-colors hover:border-gold-500/40"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[0.6875rem] font-bold tracking-wider text-gold-400 uppercase">
                            {church.kind.replace("-", " ")}
                          </span>
                          {church.distanceKm !== undefined && (
                            <span className="text-[0.6875rem] font-bold text-emerald-400">
                              {formatDistance(church.distanceKm)}
                            </span>
                          )}
                        </div>
                        <h4 className="mt-1 font-display text-base font-bold text-white">{church.name}</h4>
                        <p className="mt-1 flex items-center gap-1 text-xs text-neutral-300">
                          <MapPin className="size-3 shrink-0 text-gold-400" />
                          <span className="line-clamp-1">{church.locality || church.address}</span>
                        </p>
                        {church.address && (
                          <p className="mt-1 line-clamp-1 font-mono text-[0.6875rem] text-neutral-400">
                            {church.address}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                        <a
                          href={buildGoogleMapsUrl(locationString)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gold-300 hover:text-white"
                        >
                          <ExternalLink className="size-3" />
                          <span>Google Maps</span>
                        </a>

                        <Link
                          href={routes.unit(church.slug)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-gold-300"
                        >
                          <span>Parish Page</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Individual Church Quick-View Dialog */}
      <Dialog
        open={selectedChurch !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedChurch(null);
        }}
      >
        {selectedChurch && (
          <DialogContent className="max-w-xl border border-white/15 bg-neutral-950 p-6 text-white shadow-2xl sm:rounded-2xl sm:p-8">
            <DialogHeader className="pr-4">
              <span className="text-xs font-bold tracking-widest text-gold-400 uppercase">
                {selectedChurch.kind.replace("-", " ")}
              </span>
              <DialogTitle className="mt-1 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {selectedChurch.name}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
                <MapPin className="size-4 shrink-0 text-gold-400" />
                <span>{selectedChurch.locality || selectedChurch.address || "Holy Order Territory"}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="my-4 space-y-4">
              {/* Worship Times */}
              <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gold-400 uppercase">
                  <Clock className="size-4 text-gold-400" />
                  <span>Gathering Schedule</span>
                </div>
                <p className="mt-1.5 text-sm text-neutral-200">
                  Sunday Divine Worship: 10:00 AM · Tuesday Bible Studies: 6:00 PM
                </p>
              </div>

              {/* Address with One-Click Copy */}
              <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-gold-400 uppercase">
                    <Building2 className="size-4 text-gold-400" />
                    <span>Location Address</span>
                  </span>
                  {selectedChurch.address && (
                    <button
                      type="button"
                      onClick={() => handleCopyAddress(selectedChurch.address!)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-neutral-400 hover:text-white"
                    >
                      {copiedAddress === selectedChurch.address ? (
                        <>
                          <Check className="size-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-1.5 font-mono text-xs text-neutral-300">
                  {selectedChurch.address || selectedChurch.locality || "Registered in official directory"}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <a
                href={buildGoogleMapsUrl(
                  selectedChurch.address || selectedChurch.locality || selectedChurch.name,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-6 text-sm font-semibold text-white transition-colors hover:border-gold-500 hover:text-gold-300"
              >
                <ExternalLink className="size-4" />
                <span>Google Maps Directions</span>
              </a>

              <Link
                href={routes.unit(selectedChurch.slug)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-bold text-neutral-950 shadow-md transition-all hover:bg-gold-400 hover:shadow-lg"
              >
                <Sparkles className="size-4" />
                <span>Visit Parish Profile</span>
              </Link>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
