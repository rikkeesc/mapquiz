import type { MapData } from "../data/types.ts";

type Props = {
  map: MapData;
  onSelect: (cca3: string) => void;
};

export function Map({ map, onSelect }: Props) {
    return (
        <svg viewBox={map.viewBox} className="map">
            {map.countries.map((c) => (
                <path
                    key={c.cca3}
                    d={c.d}
                    className="country"
                    onClick={() => onSelect(c.cca3)}
                >
                    <title>{c.name}</title>
                </path>
            ))}
        </svg>
    );
}