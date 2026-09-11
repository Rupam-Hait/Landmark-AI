import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polygon } from 'react-leaflet';
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
  ShieldCheck,
  Building2,
  Eye,
  ExternalLink,
  ChevronRight,
  Filter,
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
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [mapMode, setMapMode] = useState('both'); // 'districts', 'parcels', 'both'
  const [mapCenter, setMapCenter] = useState([26.9124, 75.7873]); // Default Jaipur, India
  const [mapZoom, setMapZoom] = useState(7);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      const res = await api.getDistricts();
      setDistricts(res || []);
      if (res && res.length > 0) {
        setSelectedDistrict(res[0]);
        if (res[0].plots && res[0].plots.length > 0) {
          setSelectedPlot(res[0].plots[0]);
        }
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
    setSelectedPlot(dist.plots && dist.plots.length > 0 ? dist.plots[0] : null);
    setMapCenter([dist.lat, dist.lng]);
    setMapZoom(11);
  };

  const handleSelectPlot = (plot, dist) => {
    setSelectedPlot(plot);
    setSelectedDistrict(dist);
    setMapCenter([plot.lat, plot.lng]);
    setMapZoom(14);
  };

  // Extract all plots across districts
  const allPlots = districts.flatMap((d) =>
    (d.plots || []).map((p) => ({ ...p, districtName: d.district, stateName: d.state }))
  );

  const filteredPlots = allPlots.filter((p) => {
    const matchesSearch =
      p.khasra.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.ulpin.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.districtName.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">National Cadastral GIS &amp; Parcel Map</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              ULPIN Spatial Geo-Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Geospatial tracking of digitized revenue registers, text-to-spatial linkages, and boundary anomaly detection.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Map Layer Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 text-xs">
            <button
              onClick={() => setMapMode('both')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapMode === 'both' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setMapMode('parcels')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapMode === 'parcels' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cadastral Plots
            </button>
            <button
              onClick={() => setMapMode('districts')}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                mapMode === 'districts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Districts
            </button>
          </div>

          <button
            onClick={fetchDistricts}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Refresh GIS"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Map & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Map View (Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 h-[720px] flex flex-col shadow-xl">
          <div className="flex flex-wrap items-center justify-between text-xs pb-2 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-200">Interactive Geo-Spatial Cadastre Viewer</span>
            </div>

            {/* Map Legend */}
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Verified Parcel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Pending Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>Flagged / Boundary Conflict</span>
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

              {/* District Macro Markers */}
              {(mapMode === 'districts' || mapMode === 'both') &&
                districts.map((dist) => {
                  let markerColor = '#10b981';
                  if (dist.completion_rate < 50 || dist.pending_records > 2) {
                    markerColor = '#ef4444';
                  } else if (dist.completion_rate < 80) {
                    markerColor = '#f59e0b';
                  }
                  const radius = Math.max(14, Math.min(28, (dist.total_records || 30000) / 2500));

                  return (
                    <CircleMarker
                      key={dist.district}
                      center={[dist.lat, dist.lng]}
                      radius={radius}
                      pathOptions={{
                        color: markerColor,
                        fillColor: markerColor,
                        fillOpacity: 0.6,
                        weight: 2,
                      }}
                      eventHandlers={{
                        click: () => handleSelectDistrict(dist),
                      }}
                    >
                      <Popup>
                        <div className="p-1.5 space-y-2 text-slate-100 font-sans min-w-[210px]">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                            <h4 className="font-bold text-sm text-indigo-300">{dist.district} Revenue Division</h4>
                            <span className="text-[10px] text-slate-400 font-medium">{dist.state}</span>
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Parcels:</span>
                              <span className="font-mono font-semibold">{dist.total_records?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Accuracy / Rate:</span>
                              <span className="font-mono text-emerald-400 font-bold">{dist.accuracy_rate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Pending Review:</span>
                              <span className="font-mono text-amber-400 font-semibold">{dist.pending_records}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Boundary Flags:</span>
                              <span className="font-mono text-rose-400 font-semibold">{dist.flagged_records}</span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

              {/* Micro Cadastral Plot Markers */}
              {(mapMode === 'parcels' || mapMode === 'both') &&
                filteredPlots.map((plot, idx) => {
                  let pColor = '#10b981'; // Green Verified
                  if (plot.status === 'PENDING') pColor = '#f59e0b'; // Amber
                  if (plot.status === 'FLAGGED') pColor = '#ef4444'; // Red

                  return (
                    <CircleMarker
                      key={`plot-${idx}`}
                      center={[plot.lat, plot.lng]}
                      radius={10}
                      pathOptions={{
                        color: pColor,
                        fillColor: pColor,
                        fillOpacity: 0.85,
                        weight: 2,
                      }}
                      eventHandlers={{
                        click: () => {
                          const parentDist = districts.find((d) => d.district === plot.districtName);
                          handleSelectPlot(plot, parentDist);
                        },
                      }}
                    >
                      <Popup>
                        <div className="p-1 space-y-2 text-slate-100 font-sans min-w-[220px]">
                          <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                            <span className="font-mono font-bold text-xs text-indigo-300">
                              Khasra #{plot.khasra}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                plot.status === 'VERIFIED'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : plot.status === 'FLAGGED'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {plot.status}
                            </span>
                          </div>
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-slate-400 text-[11px] block">Owner:</span>
                              <span className="font-semibold text-slate-200">{plot.owner}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">Area:</span>
                              <span className="font-mono text-emerald-400 font-semibold">{plot.area}</span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span className="text-slate-400">ULPIN:</span>
                              <span className="font-mono text-indigo-300">{plot.ulpin}</span>
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

        {/* Right Drawer (Col 4): Parcel & Division Details */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 h-[720px] flex flex-col shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Cadastral Plot Explorer</h3>
            <p className="text-xs text-slate-400 mt-0.5">Search parcels by Khasra number or ULPIN identifier</p>
          </div>

          {/* Search & Status Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Khasra #, Owner, or ULPIN..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['ALL', 'VERIFIED', 'PENDING', 'FLAGGED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Parcel Inspector Card */}
          {selectedPlot && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3 animate-fade-in shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">
                    Selected Cadastral Parcel
                  </span>
                  <h4 className="text-base font-mono font-bold text-white">Khasra #{selectedPlot.khasra}</h4>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                    selectedPlot.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : selectedPlot.status === 'FLAGGED'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {selectedPlot.status}
                </span>
              </div>

              <div className="space-y-2 text-xs pt-1 border-t border-slate-800">
                <div>
                  <span className="text-slate-400 text-[11px] block">Title Holder / Khatedar:</span>
                  <p className="font-semibold text-slate-100">{selectedPlot.owner}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Area Extent:</span>
                    <p className="font-mono font-semibold text-emerald-400">{selectedPlot.area}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Land Type:</span>
                    <p className="font-medium text-slate-200">{selectedPlot.type || 'Agricultural'}</p>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[11px] block">14-Digit ULPIN (Bhu-Aadhaar):</span>
                  <p className="font-mono text-indigo-300 text-[11px] bg-slate-950/80 p-1.5 rounded-lg border border-slate-800 select-all">
                    {selectedPlot.ulpin}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => onNavigate('records')}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Record</span>
                </button>
                {selectedPlot.status !== 'VERIFIED' && (
                  <button
                    onClick={() => onNavigate(selectedPlot.status === 'FLAGGED' ? 'fraud' : 'review')}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <span>Action</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable Parcel List */}
          <div className="space-y-2 flex-1 overflow-y-auto pr-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
              Parcels in Active View ({filteredPlots.length})
            </span>
            {filteredPlots.map((p, idx) => {
              const isSel = selectedPlot?.ulpin === p.ulpin;
              return (
                <div
                  key={`list-plot-${idx}`}
                  onClick={() => {
                    const parentDist = districts.find((d) => d.district === p.districtName);
                    handleSelectPlot(p, parentDist);
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                    isSel
                      ? 'bg-slate-800 border-indigo-500 text-slate-100 shadow'
                      : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="font-mono font-bold text-indigo-300">Khasra #{p.khasra}</div>
                    <div className="text-[11px] text-slate-300 font-medium truncate max-w-[160px]">{p.owner}</div>
                    <div className="text-[10px] text-slate-500">{p.districtName} &bull; {p.area}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        p.status === 'VERIFIED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : p.status === 'FLAGGED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {p.status}
                    </span>
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

