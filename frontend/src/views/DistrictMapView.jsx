import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import {
  MapPin,
  CheckCircle2,
  Clock,
  AlertOctagon,
  TrendingUp,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';
import { api } from '../api';

// Helper component to center map smoothly
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export const DistrictMapView = ({ onNavigate }) => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [mapCenter, setMapCenter] = useState([22.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const res = await api.getDistricts();
      setDistricts(res || []);
      if (res && res.length > 0) {
        setSelectedDistrict(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDistricts();
  }, []);

  const handleSelectDistrict = (dist) => {
    setSelectedDistrict(dist);
    setMapCenter([dist.lat, dist.lng]);
    setMapZoom(7);
  };

  const filteredDistricts = districts.filter(
    (d) =>
      d.district.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">National Cadastral Progress Map (GIS)</h2>
          <p className="text-xs text-slate-400 mt-1">
            Geographical monitoring of land records digitization, verification rates, and review backlog per district.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDistricts}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh GIS</span>
          </button>
        </div>
      </div>

      {/* Map & District Drawer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Map View (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 h-[680px] flex flex-col">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-200">Revenue Divisions Geo-Spatial View</span>
            </div>
            {/* Map Legend */}
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>&ge; 80% Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>50-79% Progress</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>&lt; 50% / High Review Backlog</span>
              </div>
            </div>
          </div>

          {/* Leaflet Canvas */}
          <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-800">
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              className="h-full w-full"
            >
              <MapController center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {districts.map((dist) => {
                let markerColor = '#10b981'; // Green
                if (dist.completion_rate < 50 || dist.pending_records > 2) {
                  markerColor = '#ef4444'; // Red
                } else if (dist.completion_rate < 80) {
                  markerColor = '#f59e0b'; // Amber
                }

                const radius = Math.max(10, Math.min(26, dist.total_records * 2.8));

                return (
                  <CircleMarker
                    key={dist.district}
                    center={[dist.lat, dist.lng]}
                    radius={radius}
                    pathOptions={{
                      color: markerColor,
                      fillColor: markerColor,
                      fillOpacity: 0.7,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => handleSelectDistrict(dist),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-2 text-slate-100 font-sans min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                          <h4 className="font-bold text-sm text-indigo-300">{dist.district}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">{dist.state}</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Parcels:</span>
                            <span className="font-mono font-semibold">{dist.total_records}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Completion:</span>
                            <span className="font-mono text-emerald-400 font-bold">{dist.completion_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pending Review:</span>
                            <span className="font-mono text-amber-400 font-semibold">{dist.pending_records}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Flagged Conflicts:</span>
                            <span className="font-mono text-rose-400 font-semibold">{dist.flagged_records}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Area:</span>
                            <span className="font-mono text-slate-200">{dist.total_area_acres} Acres</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Right Drawer (Col 4): District Breakdown List */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 h-[680px] flex flex-col">
          <div>
            <h3 className="text-sm font-bold text-slate-100">District Revenue Divisions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Select a division to inspect geospatial progress</p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search district or state..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Selected District Card if any */}
          {selectedDistrict && (
            <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{selectedDistrict.district} Division</h4>
                  <span className="text-[11px] text-indigo-300 font-medium">{selectedDistrict.state}</span>
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {selectedDistrict.completion_rate}% Done
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-indigo-500/20">
                <div>
                  <span className="text-slate-400">Total Parcels:</span>
                  <p className="font-mono font-semibold text-slate-200 mt-0.5">{selectedDistrict.total_records}</p>
                </div>
                <div>
                  <span className="text-slate-400">Verified:</span>
                  <p className="font-mono font-semibold text-emerald-400 mt-0.5">{selectedDistrict.verified_records}</p>
                </div>
                <div>
                  <span className="text-slate-400">Pending Review:</span>
                  <p className="font-mono font-semibold text-amber-400 mt-0.5">{selectedDistrict.pending_records}</p>
                </div>
                <div>
                  <span className="text-slate-400">Area Digitized:</span>
                  <p className="font-mono font-semibold text-slate-200 mt-0.5">{selectedDistrict.total_area_acres} Ac</p>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable District List */}
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            {filteredDistricts.map((d) => {
              const isSel = selectedDistrict?.district === d.district;
              return (
                <div
                  key={d.district}
                  onClick={() => handleSelectDistrict(d)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    isSel
                      ? 'bg-slate-800 border-indigo-500 text-slate-100 shadow'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-200">{d.district}</div>
                    <div className="text-[11px] text-slate-400">{d.state} &bull; {d.total_records} Records</div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-semibold text-emerald-400">{d.completion_rate}%</div>
                    {d.pending_records > 0 && (
                      <div className="text-[10px] text-amber-400 font-mono">{d.pending_records} Pending</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
