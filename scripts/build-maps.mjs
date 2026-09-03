import topo from "world-atlas/countries-50m.json" with { type: "json" };
import wc from "world-countries/countries.json" with { type: "json" };
import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";
import { geoBounds } from "d3-geo";
import { writeFileSync } from "node:fs";
import { geoCentroid } from "d3-geo";

const byCcn3 = new Map(wc.filter((c) => c.ccn3).map((c) => [c.ccn3, c]));
const byName = new Map(wc.map((c) => [c.name.common, c]));

const BBOX = [-25, 34, 45, 71]; // west, south, east, north
const W = 900, H = 620;
const minSize = 10;

const lonOverlaps = (w, e, pw, pe) =>
  pw <= pe
    ? pe >= w && pw <= e            // normal
    : pe >= w || pw <= e;           // wraps the antimeridian

const intersects = ([w, s, e, n], [[pw, ps], [pe, pn]]) =>
  lonOverlaps(w, e, pw, pe) && pn >= s && ps <= n;


function trimToBBox(f, bbox) {
  if (f.geometry.type !== "MultiPolygon") {
    return intersects(bbox, geoBounds(f)) ? f : null;
  }

  const kept = f.geometry.coordinates.filter((rings) =>
    intersects(bbox, geoBounds({
      type: "Feature",
      properties: f.properties,
      geometry: { type: "Polygon", coordinates: rings },
    })),
  );

  if (kept.length === 0) return null;
  return { ...f, geometry: { type: "MultiPolygon", coordinates: kept } };
}

const all = feature(topo, topo.objects.countries).features
  .map((f) => {
    const meta = byCcn3.get(String(f.id ?? "")) ?? byName.get(f.properties.name);
    if (!meta || meta.independent === false) return null;
    return {
      ...f,
      properties: {
        ccn3: meta.ccn3,
        cca3: meta.cca3,
        name: meta.name.common,
        capital: meta.capital[0] ?? null,
        region: meta.region,
        subregion: meta.subregion,
      },
    };
  })
  .filter(Boolean);

  const corners = (w, s, e, n) => ({
    type: "MultiPoint",
    coordinates: [[w, s], [e, s], [e, n], [w, n]],
  });
  
  const proj = geoMercator().fitExtent([[16, 16], [W - 16, H - 16]], corners(...BBOX));
  const path = geoPath(proj);

const trimmed = all
  .filter((f) => f.properties.region === "Europe")
  .map((f) => trimToBBox(f, BBOX))
  .filter(Boolean);

const europe = trimmed.filter((f) => path.area(f) >= minSize);
const dropped = trimmed.filter((f) => path.area(f) < minSize);
console.log("dropped (too small):", dropped.map((f) => f.properties.name));

const shapes = europe
  .map((f) => `<path d="${path(f)}" fill="#e8e0cf" stroke="#16323c" stroke-width="0.6"/>`)
  .join("");

writeFileSync(
  "src/data/maps/europe.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#16323c"/>${shapes}</svg>`,
);

const data = {
  id: "europe",
  viewBox: `0 0 ${W} ${H}`,
  countries: europe.map((f) => ({
    cca3: f.properties.cca3,
    name: f.properties.name,
    d: path(f),
  })),
};

writeFileSync("src/data/maps/europe.json", JSON.stringify(data));
