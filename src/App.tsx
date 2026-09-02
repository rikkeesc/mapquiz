import './App.css'
import europe from "./data/maps/europe.json";
import {Map as CountryMap} from "./components/Map";
import {reducer, initialState} from "./game/game.ts";
import { useReducer } from 'react';

const codes = europe.countries.map((c) => c.cca3);
const nameOf = new Map(europe.countries.map((c) => [c.cca3, c.name]));



function App() {
  const [state, dispatch] = useReducer(reducer, codes, initialState);

  return (
    <div>
      <div>{state.current ? nameOf.get(state.current) : null}</div>
      <CountryMap map={europe} onSelect={(cca3) => dispatch({ type: "guess", cca3 })} />
    </div>
  )
}

export default App
