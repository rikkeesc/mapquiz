import './App.css'
import europe from "./data/maps/europe.json";
import {Map} from "./components/Map";



function App() {

  return (
    <Map map={europe} onSelect={(cca3) => console.log(cca3)} />
  )
}

export default App
