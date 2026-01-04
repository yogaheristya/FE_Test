"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Coordinate = {
  ordering: number;
  coordinates: string;
};

type Ruas = {
  ruas_name: string;
  unit_id: number;
  long: number;
  km_awal: string;
  km_akhir: string;
  coordinates: Coordinate[];
};

const UNIT_COLORS: Record<number, string> = {
  1: "#2563eb",
  2: "#16a34a",
  3: "#dc2626",
  4: "#7c3aed",
};
const getUnitColor = (unitId: number) => UNIT_COLORS[unitId] ?? "#0f172a";

async function snapToRoadOSRM(
  coords: [number, number][]
): Promise<GeoJSON.LineString | null> {
  if (coords.length < 2) return null;

  const coordString = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");

  const url =
    `https://router.project-osrm.org/route/v1/driving/${coordString}` +
    `?overview=full&geometries=geojson`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const json = await res.json();
  if (!json.routes?.length) return null;

  return json.routes[0].geometry;
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.FeatureGroup | null>(null);
  const boundsRef = useRef<L.LatLngBounds | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      preferCanvas: true,
    }).setView([-6.2, 106.816666], 10);

    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    layerGroupRef.current = L.featureGroup().addTo(map);

    map.once("load", () => {
      if (boundsRef.current) {
        map.fitBounds(boundsRef.current, { padding: [30, 30] });
      }
    });

    const fetchRuas = async () => {
      try {
        const res = await fetch("/api/ruas?show=active_only&per_page=100");
        if (!res.ok) {
          console.error("Gagal fetch ruas:", res.status);
          return;
        }

        const json = await res.json();
        const ruasList: Ruas[] = json?.data ?? [];
        if (!ruasList.length || !layerGroupRef.current) return;

        for (const ruas of ruasList) {
          if (!ruas.coordinates || ruas.coordinates.length < 2) continue;

          const baseColor = getUnitColor(ruas.unit_id);

          const rawCoords: [number, number][] = ruas.coordinates
            .sort((a, b) => a.ordering - b.ordering)
            .map((c) => {
              const [lat, lng] = c.coordinates.split(",").map(Number);
              return [lat, lng];
            });

          let layer: L.Layer | null = null;

          try {
            const geometry = await snapToRoadOSRM(rawCoords);
            if (geometry) {
              layer = L.geoJSON(geometry, {
                style: {
                  color: baseColor,
                  weight: 4,
                  opacity: 0.9,
                },
              });
            }
          } catch {
            // ignore → fallback
          }

          if (!layer) {
            layer = L.polyline(rawCoords, {
              color: baseColor,
              weight: 4,
              opacity: 0.9,
            });
          }

          layer.on("mouseover", () => {
            (layer as any).setStyle?.({
              weight: 7,
              color: "#f59e0b",
            });
          });
          layer.on("mouseout", () => {
            (layer as any).setStyle?.({
              weight: 4,
              color: baseColor,
            });
          });

          // popup
          (layer as any).bindPopup?.(`
            <div style="min-width:200px">
              <strong>${ruas.ruas_name}</strong><br/>
              Unit: ${ruas.unit_id}<br/>
              Panjang: ${ruas.long} km<br/>
              KM: ${ruas.km_awal} - ${ruas.km_akhir}
            </div>
          `);

          layer.addTo(layerGroupRef.current!);

          // titik koordinat
          ruas.coordinates.forEach((c) => {
            const [lat, lng] = c.coordinates.split(",").map(Number);
            L.circleMarker([lat, lng], {
              radius: 5,
              color: baseColor,
              fillColor: baseColor,
              fillOpacity: 1,
              weight: 1,
            })
              .bindPopup(
                `
                <b>${ruas.ruas_name}</b><br/>
                Titik ke-${c.ordering + 1}<br/>
                ${lat.toFixed(6)}, ${lng.toFixed(6)}
              `
              )
              .addTo(layerGroupRef.current!);
          });
        }

        const bounds = layerGroupRef.current.getBounds();
        if (bounds.isValid()) {
          boundsRef.current = bounds;
        }
      } catch (err) {
        console.error("Fetch ruas error:", err);
      }
    };

    fetchRuas();

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ height: "100vh", width: "100%" }} />;
}
