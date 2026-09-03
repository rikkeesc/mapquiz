import type { MapData } from "../data/types.ts";
import type {Status} from "../game/game.ts";

type Props = {
  map: MapData;
  onSelect: (cca3: string) => void;
  results?: Record<string, Status>;
};

export function Map({ map, onSelect, results }: Props) {
    return (
        <svg viewBox={map.viewBox} className="map">
            {map.countries.map((c) => (
                <path
                    key={c.cca3}
                    d={c.d}
                    className={"country " + (results?.[c.cca3] ?? "")}
                    onClick={() => onSelect(c.cca3)}
                >
                    <title>{c.name}</title>
                </path>
            ))}
        </svg>
    );
}