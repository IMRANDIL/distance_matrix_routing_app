
import { useEffect, useRef, useState } from 'react';
import './App.css';

import tt from '@tomtom-international/web-sdk-maps';





const App = () => {
  const mapElement = useRef()
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(87.186058);
  const [latitude, setLatitude] = useState(26.053230)




  useEffect(() => {
    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_KEY,
      container: mapElement.current,
      center: [longitude, latitude],
      zoom: 14
    });


    setMap(map)
  }, [latitude, longitude])




  return (
    <div className="App">
      <div ref={mapElement} className='map'></div>
    </div>
  );
}

export default App;
