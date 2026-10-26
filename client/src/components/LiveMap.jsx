import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const LiveMap = ({ location }) => {
  if (!location || !location.latitude || !location.longitude) {
    return (
      <div className="h-[300px] w-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
        Waiting for location...
      </div>
    );
  }

  const position = [location.latitude, location.longitude];

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            Current Location <br /> Accuracy: {Math.round(location.accuracy)}m
          </Popup>
        </Marker>
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
};

export default LiveMap;
