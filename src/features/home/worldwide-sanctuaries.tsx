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
  units: Unit[];
  pageCount?: number;
}

type TerritoryFilter = "all" | "headquarters" | "uk-europe" | "north-america" | "provinces";

const FILTER_TABS: { id: TerritoryFilter; label: string }[] = [
  { id: "all", label: "All Sanctuaries" },
  { id: "headquarters", label: "Principal Headquarters" },
  { id: "uk-europe", label: "United Kingdom & Europe" },
  { id: "north-america", label: "North America" },
  { id: "provinces", label: "Provinces & Dioceses" },
];

const POPULAR_SEARCH_CITIES = [
  "Lagos",
  "Port Harcourt",
  "Abuja",
  "London",
  "United States",
  "Ibadan",
  "Canada",
];

// Curated authentic visual library for ecclesiastical architecture
const CATHEDRAL_COVERS: Record<string, string> = {
  "mount-zion-general-headquarters": "/brand/hero-mount-zion.webp",
  "national-headquarters": "/brand/hero-fathers.webp",
  "national-headquarters-annex-abuja": "/media/legacy/2026/02/AT107.jpg.webp",
  "london-cathedral": "/media/legacy/2026/02/IMG_9769.jpg.webp",
  "memorial-holy-temple": "/media/legacy/2026/02/MOAL-1.jpg.webp",
  "new-york-bronx": "/media/legacy/2026/02/IMG_9657.jpg.webp",
  "houston-texas": "/media/legacy/2026/02/AT24.jpg.webp",
  "rumuomasi-province": "/media/legacy/2026/02/AT18.jpg.webp",
  "ebute-metta-province": "/brand/hero-mount-zion.webp",
  "lagos-province": "/media/legacy/2026/02/MOAL-25.jpg.webp",
  "port-harcourt-province": "/media/legacy/2026/02/AT18.jpg.webp",
  "abuja-province": "/media/legacy/2026/02/AT107.jpg.webp",
};

const DEFAULT_COVER = "/brand/hero-mount-zion.webp";

interface UnitWithDistance extends Unit {
  distanceKm?: number;
  coverImage: string;
}

export function WorldwideSanctuaries({ units, pageCount }: WorldwideSanctuariesProps) {
  const [activeTab, setActiveTab] = useState<TerritoryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithDistance | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const totalCount = pageCount ?? units.length;
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

  // Map real units, attach authentic photos & compute live distance if user coordinates available
  const enrichedUnits: UnitWithDistance[] = useMemo(() => {
    return units.map((u) => {
      const coverImage = u.cover?.url || CATHEDRAL_COVERS[u.slug] || DEFAULT_COVER;

      if (!userLocation) {
        return { ...u, coverImage };
      }

      const unitCoords = resolveCoordinates(u.locality, u.name, u.country);
      if (!unitCoords) {
        return { ...u, coverImage };
      }

      const distanceKm = calculateDistance(userLocation, unitCoords, "km");
      return { ...u, coverImage, distanceKm };
    });
  }, [units, userLocation]);

  // Automated Filter & Search Pipeline
  const filteredUnits = useMemo(() => {
    let list = enrichedUnits;

    // Filter by territory / kind tab
    if (activeTab === "headquarters") {
      list = list.filter((u) => u.kind === "headquarters");
    } else if (activeTab === "uk-europe") {
      list = list.filter((u) => u.country === "GB" || u.country === "BE");
    } else if (activeTab === "north-america") {
      list = list.filter((u) => u.country === "US" || u.country === "CA");
    } else if (activeTab === "provinces") {
      list = list.filter((u) => u.kind === "province" || u.kind === "special-area" || u.kind === "district");
    }

    // Filter by search query
    if (deferredSearch) {
      list = list.filter((u) => {
        const searchCorpus = [u.name, u.locality, u.address, u.country]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return searchCorpus.includes(deferredSearch);
      });
    }

    // Sort by proximity when user location is available; otherwise prioritize headquarters & major seats
    if (userLocation) {
      list = [...list].sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
    } else {
      list = [...list].sort((a, b) => {
        if (a.kind === "headquarters" && b.kind !== "headquarters") return -1;
        if (b.kind === "headquarters" && a.kind !== "headquarters") return 1;
        return a.name.localeCompare(b.name, "en");
      });
    }

    return list;
  }, [enrichedUnits, activeTab, deferredSearch, userLocation]);

  // Display top 6 featured cards in the visual grid
  const showcaseUnits = useMemo(() => {
    return filteredUnits.slice(0, 6);
  }, [filteredUnits]);

  const handleCopyAddress = (address: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2200);
    }
  };

  return (
    <section
      id="worldwide-presence"
      aria-labelledby="worldwide-presence-heading"
      className="relative isolate overflow-hidden border-t border-white/10 bg-[#09090c] py-24 text-white sm:py-32 lg:py-36"
    >
      {/* Ambient Liturgical Glow - with canonical classes */}
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
        {/* Header Section */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-950/40 px-4 py-1.5 text-xs font-bold tracking-widest text-gold-300 uppercase shadow-xs backdrop-blur-md">
            <Globe className="size-3.5 text-gold-400" />
            <span>Worldwide Parish Directory · Est. 1925</span>
          </div>

          {/* Headline with High-Impact Accent Color */}
          <h2
            id="worldwide-presence-heading"
            className="mt-6 font-display text-[clamp(2.5rem,2.1rem+3vw,4.75rem)] leading-[1.05] font-extrabold tracking-tight text-balance text-white uppercase"
          >
            We Are A House Of Prayer <span className="font-black text-gold-400">In Every City</span>
          </h2>

          {/* Subtitle */}
          <p className="mt-5 max-w-3xl text-base leading-relaxed font-normal text-neutral-300 sm:text-lg lg:text-xl">
            Search {totalCount} churches, provincial secretariats, and prayer houses across Nigeria and the
            global diaspora. Find your spiritual home and walk in apostolic communion.
          </p>

          {/* Location Automation Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="group inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full border border-gold-500/50 bg-gold-500/10 px-7 text-sm font-bold text-gold-300 shadow-lg transition-all duration-300 hover:border-gold-400 hover:bg-gold-500 hover:text-neutral-950 hover:shadow-gold-500/20 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none disabled:opacity-50"
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

            <Link
              href={routes.find()}
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-full border border-neutral-700 bg-neutral-900/90 px-7 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:border-neutral-500 hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
            >
              <span>Browse Full Directory ({totalCount})</span>
              <Compass className="size-4 text-neutral-400" />
            </Link>
          </div>

          {/* Geolocation feedback note */}
          {locationStatus && (
            <p className="mt-3 animate-fade-in text-xs font-semibold text-gold-300">{locationStatus}</p>
          )}

          {/* Category / Territory Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter Sanctuaries by Region"
            className="mt-10 flex w-full max-w-4xl flex-wrap items-center justify-center gap-2 p-1.5"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex cursor-pointer items-center rounded-full px-5 py-2 text-xs font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none sm:text-sm ${
                    isActive
                      ? "bg-gold-500 font-bold text-neutral-950 shadow-md shadow-gold-500/20"
                      : "border border-white/10 bg-white/5 text-neutral-300 hover:border-white/25 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6-Card Showcase Grid - with canonical aspect ratio */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          {showcaseUnits.map((sanctuary) => (
            <article
              key={sanctuary.slug}
              onClick={() => setSelectedUnit(sanctuary)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedUnit(sanctuary);
                }
              }}
              tabIndex={0}
              role="button"
              aria-haspopup="dialog"
              aria-label={`View details and worship times for ${sanctuary.name}`}
              className="group relative flex aspect-16/11 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-md transition-all duration-500 select-none hover:-translate-y-1.5 hover:border-gold-500/60 hover:shadow-2xl hover:shadow-gold-500/10 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
            >
              {/* Background Cathedral / Visual */}
              <Image
                src={sanctuary.coverImage}
                alt={sanctuary.name}
                fill
                sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* High Dynamic Range Shadow Overlay */}
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-black/95 via-black/45 to-black/20 transition-opacity duration-300 group-hover:opacity-90"
              />

              {/* Top Row: Kind Badge & Live Distance */}
              <div className="relative z-10 flex items-center justify-between p-5">
                <span className="rounded-full border border-gold-500/40 bg-neutral-950/80 px-3.5 py-1 text-[0.6875rem] font-bold tracking-wider text-gold-300 uppercase shadow-xs backdrop-blur-md">
                  {sanctuary.kind.replace("-", " ")}
                </span>

                {sanctuary.distanceKm !== undefined ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-black/80 px-3 py-1 text-[0.6875rem] font-bold text-emerald-300 backdrop-blur-md">
                    <Navigation className="size-3 text-emerald-400" />
                    {formatDistance(sanctuary.distanceKm)}
                  </span>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-all duration-300 group-hover:border-gold-500/50 group-hover:bg-gold-500 group-hover:text-neutral-950">
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                )}
              </div>

              {/* Bottom Content: Real Titles & Locality */}
              <div className="relative z-10 p-6 text-white">
                <h3 className="font-display text-2xl leading-tight font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-gold-200 sm:text-[1.75rem]">
                  {sanctuary.name}
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
                  <MapPin className="size-3.5 shrink-0 text-gold-400" />
                  <span>{sanctuary.locality || sanctuary.address || "Holy Order Territory"}</span>
                </p>

                {sanctuary.address && (
                  <p className="mt-1.5 line-clamp-1 font-mono text-xs text-neutral-400">
                    {sanctuary.address}
                  </p>
                )}

                {/* Micro Hover Cue */}
                <div className="mt-3 flex translate-y-2 transform items-center gap-1 text-xs font-bold text-gold-400 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <span>View Details & Directions</span>
                  <ArrowRight className="size-3" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Search & Quick-Discovery Band */}
        <div className="mt-16 rounded-2xl border border-white/10 bg-neutral-950/80 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h3 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                Looking for a church near your home or office?
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-300">
                Filter across all {totalCount} churches, provincial secretariats, and prayer houses or search
                by town name.
              </p>
            </div>

            {/* Quick Search Form */}
            <form onSubmit={(e) => e.preventDefault()} role="search" className="flex w-full max-w-md gap-2.5">
              <label htmlFor="worldwide-search-input" className="sr-only">
                Search parish by city or province
              </label>
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="worldwide-search-input"
                  name="q"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter city, province, or parish name..."
                  className="h-12 w-full rounded-full border border-white/20 bg-neutral-900 pr-4 pl-11 text-sm text-white outline-none placeholder:text-neutral-400 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
                />
              </div>
              <Link
                href={routes.find(searchQuery ? { q: searchQuery } : {})}
                className="inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full bg-gold-500 px-6 text-sm font-bold text-neutral-950 shadow-md transition-all hover:bg-gold-400 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
              >
                Search
              </Link>
            </form>
          </div>

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

      {/* Interactive Sanctuary Quick-View Modal */}
      <Dialog
        open={selectedUnit !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedUnit(null);
        }}
      >
        {selectedUnit && (
          <DialogContent className="max-w-2xl overflow-hidden border border-white/15 bg-neutral-950 p-0 text-white shadow-2xl sm:rounded-2xl">
            {/* Modal Photographic Banner - with canonical aspect ratio */}
            <div className="relative aspect-16/8 w-full overflow-hidden bg-neutral-900">
              <Image src={selectedUnit.coverImage} alt={selectedUnit.name} fill className="object-cover" />
              <div
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/60 to-transparent"
              />

              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <span className="rounded-full border border-gold-500/40 bg-black/80 px-3.5 py-1 text-xs font-bold tracking-wider text-gold-300 uppercase backdrop-blur-md">
                  {selectedUnit.kind.replace("-", " ")}
                </span>
                {selectedUnit.distanceKm !== undefined && (
                  <span className="rounded-full border border-emerald-500/40 bg-black/80 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md">
                    {formatDistance(selectedUnit.distanceKm)}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <DialogHeader className="pr-4">
                <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  {selectedUnit.name}
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gold-300">
                  <MapPin className="size-4 shrink-0 text-gold-400" />
                  <span>{selectedUnit.locality || selectedUnit.address || "Holy Order Territory"}</span>
                </DialogDescription>
              </DialogHeader>

              {/* Tagline / Description */}
              {selectedUnit.tagline && (
                <p className="text-sm leading-relaxed text-neutral-300 sm:text-base">
                  {selectedUnit.tagline}
                </p>
              )}

              {/* Details Cards Grid */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* Worship Schedule */}
                <div className="rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-gold-400 uppercase">
                    <Clock className="size-4 text-gold-400" />
                    <span>Worship Gatherings</span>
                  </div>
                  <p className="mt-2 text-sm leading-snug text-neutral-200">
                    Sunday Divine Worship: 10:00 AM · Tuesday Bible Studies: 6:00 PM
                  </p>
                </div>

                {/* Sanctuary Address & Copy Action */}
                <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-neutral-900/80 p-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold tracking-wider text-gold-400 uppercase">
                        <Building2 className="size-4 text-gold-400" />
                        <span>Address</span>
                      </span>
                      {selectedUnit.address && (
                        <button
                          type="button"
                          onClick={() => handleCopyAddress(selectedUnit.address!)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-neutral-400 transition-colors hover:text-white"
                          title="Copy address to clipboard"
                        >
                          {copiedAddress ? (
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
                    <p className="mt-2 font-mono text-xs leading-relaxed text-neutral-200">
                      {selectedUnit.address ||
                        selectedUnit.locality ||
                        "Address recorded in church directory"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <a
                  href={buildGoogleMapsUrl(
                    selectedUnit.address || selectedUnit.locality || selectedUnit.name,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-6 text-sm font-semibold text-white transition-colors hover:border-gold-500 hover:text-gold-300"
                >
                  <ExternalLink className="size-4" />
                  <span>Google Maps Directions</span>
                </a>

                <Link
                  href={routes.unit(selectedUnit.slug)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-bold text-neutral-950 shadow-md transition-all hover:bg-gold-400 hover:shadow-lg"
                >
                  <Sparkles className="size-4" />
                  <span>Visit Parish Profile</span>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
