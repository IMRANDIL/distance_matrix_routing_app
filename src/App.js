import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import { useEffect, useRef, useState } from 'react';
import './App.css';

import '@tomtom-international/web-sdk-maps/dist/maps.css'







const App = () => {
  const mapElement = useRef()
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(87.186058);
  const [latitude, setLatitude] = useState(26.053230)


  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }



  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route');
      map.removeSource('route')
    }

    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint: {
        'line-color': 'red',
        'line-width': 6
      }
    })

  }





  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div');
    element.className = 'marker-delivery'

    new tt.Marker({
      element: element
    }).setLngLat(lngLat).addTo(map)
  }






  useEffect(() => {

    const origin = {
      lng: longitude,
      lat: latitude
    }
    const destinations = []

    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true
      },
      center: [longitude, latitude],
      zoom: 9
    });


    setMap(map);



    const addMarker = () => {

      const popupOffset = {
        bottom: [0, -25]
      }

      const popup = new tt.Popup({ offset: popupOffset }).setHTML('This is You!')





      const element = document.createElement('div');
      element.className = 'marker'
      const marker = new tt.Marker({
        draggable: true,
        element: element
      }).setLngLat([longitude, latitude]).addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setLongitude(lngLat.lng)
        setLatitude(lngLat.lat)
      })

      marker.setPopup(popup).togglePopup()



    }
    addMarker();



    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination);


      })

      const callParameters = {
        key: process.env.REACT_APP_TOM_TOM_KEY,
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)]
      }


      return new Promise((resolve, reject) => {
        ttapi.services.matrixRouting(callParameters).then((matrixApiResults) => {
          const results = matrixApiResults.matrix[0];

          const resultsArray = results.map((result, index) => {
            return {
              location: locations[index],
              drivingtime: result.response.routeSummary.travelTimeInSeconds
            }
          });
          resultsArray.sort((a, b) => {
            return a.drivingtime - b.drivingtime
          })

          const sortedLocations = resultsArray.map((result) => {
            return result.location
          })
          resolve(sortedLocations)
        })
      })


    }



    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin);


        ttapi.services.calculateRoute({
          key: process.env.REACT_APP_TOM_TOM_KEY,
          locations: sorted
        }).then((routeData) => {
          const geoJson = routeData.toGeoJson();
          drawRoute(geoJson, map)
        })
      })
    }

















    map.on('click', (e) => {
      destinations.push(e.lngLat);
      addDeliveryMarker(e.lngLat, map);
      recalculateRoutes()
    })

    return () => map.remove()
  }, [latitude, longitude])




  return (
    <>
      {map &&
        <div className="App">
          <div ref={mapElement} className='map' />
          <div className='searchBar'>
            <h1>Where to?</h1>
            <input
              type='text'
              id='longitude'
              className='longitude'
              placeholder='Put in longitude'
              onChange={(e) => setLongitude(e.target.value)}
            />
            <input
              type='text'
              id='latitude'
              className='latitude'
              placeholder='Put in latitude'
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
        </div>}
    </>
  );
}

export default App;
