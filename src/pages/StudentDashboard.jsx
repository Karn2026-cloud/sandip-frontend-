import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../utils/socket';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import MapView from '../components/MapView';
import { MapPin, Clock, Bus, Route, Navigation, CheckCircle, AlertTriangle, Loader2, Sun, Moon, ArrowRight, Home } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [busLocation, setBusLocation] = useState(null);
  const [etas, setEtas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tripActive, setTripActive] = useState(false);
  const [routeMode, setRouteMode] = useState('morning'); // morning | evening

  useEffect(() => {
    api.get('/users/me')
      .then(res => {
        setProfile(res.data);
        if (res.data.assignedBus?.tripActive) setTripActive(true);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile data');
        setLoading(false);
      });

    const socket = getSocket();
    if (socket) {
      socket.on('bus:location-update', (data) => {
        setBusLocation({ lat: data.lat, lng: data.lng, speed: data.speed });
        if (data.etas) setEtas(data.etas);
        setTripActive(true);
      });
      socket.on('bus:trip-started', () => setTripActive(true));
      socket.on('bus:trip-ended', () => {
        setTripActive(false);
        setBusLocation(null);
        setEtas([]);
      });
    }

    return () => {
      if (socket) {
        socket.off('bus:location-update');
        socket.off('bus:trip-started');
        socket.off('bus:trip-ended');
      }
    };
  }, []);

  const bus = profile?.assignedBus;
  const myStopEta = etas.find(e => e.stopName === profile?.pickupStop);

  // Morning: Home → College, Evening: College → Home
  const pickupLabel = routeMode === 'morning' ? (profile?.pickupLocation || profile?.pickupStop) : 'College Campus (Main)';
  const dropLabel = routeMode === 'morning' ? 'College Campus (Main)' : (profile?.pickupLocation || profile?.pickupStop);

  // For evening, reverse the stops order
  const displayStops = routeMode === 'evening' ? [...(bus?.stops || [])].reverse().map((s, i) => ({ ...s, order: i + 1 })) : (bus?.stops || []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-mesh">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          {/* Loading skeleton */}
          <div className="w-full max-w-7xl px-6">
            <div className="h-8 w-64 bg-white/5 rounded-xl mb-4 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-5 animate-pulse">
                  <div className="h-3 w-20 bg-white/5 rounded mb-3" />
                  <div className="h-8 w-24 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-card p-4 animate-pulse">
                <div className="h-5 w-40 bg-white/5 rounded mb-3" />
                <div className="h-80 bg-white/5 rounded-xl" />
              </div>
              <div className="glass-card p-4 animate-pulse">
                <div className="h-5 w-36 bg-white/5 rounded mb-4" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full bg-white/10" />
                    <div className="h-4 w-28 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-mesh">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome + Route Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {profile?.name || user?.name} 👋</h2>
            <p className="text-white/50 text-sm mt-1">Track your college bus in real-time</p>
          </div>

          {/* Morning/Evening Toggle */}
          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
            <button
              onClick={() => setRouteMode('morning')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                routeMode === 'morning'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sun className="w-4 h-4" />
              Morning Route
            </button>
            <button
              onClick={() => setRouteMode('evening')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                routeMode === 'evening'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Moon className="w-4 h-4" />
              Evening Route
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}

        {/* Route Direction Card */}
        <div className="glass-card p-4 mb-6 animate-slide-up">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${routeMode === 'morning' ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                {routeMode === 'morning' ? <Home className="w-4 h-4 text-amber-400" /> : <Bus className="w-4 h-4 text-indigo-400" />}
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Pickup</p>
                <p className="text-white font-semibold text-sm">{pickupLabel}</p>
              </div>
            </div>
            <ArrowRight className={`w-5 h-5 ${routeMode === 'morning' ? 'text-amber-400' : 'text-indigo-400'}`} />
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${routeMode === 'morning' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                {routeMode === 'morning' ? <Bus className="w-4 h-4 text-emerald-400" /> : <Home className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <p className="text-white/40 text-[10px] uppercase tracking-wider font-medium">Drop</p>
                <p className="text-white font-semibold text-sm">{dropLabel}</p>
              </div>
            </div>
            <div className="ml-auto">
              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                routeMode === 'morning'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
              }`}>
                {routeMode === 'morning' ? '☀️ Home → College' : '🌙 College → Home'}
              </span>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Your Bus</p>
                <p className="text-2xl font-bold text-white mt-1">{bus?.number || 'N/A'}</p>
                <p className="text-white/40 text-xs mt-1">{bus?.route || 'No route assigned'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20">
                <Bus className="w-5 h-5 text-primary-400" />
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
                  ETA {routeMode === 'morning' ? '(To College)' : '(To Home)'}
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {tripActive && myStopEta ? `${myStopEta.eta} min` : '--'}
                </p>
                <p className="text-white/40 text-xs mt-1">{routeMode === 'morning' ? profile?.pickupStop : 'College Campus'}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Clock className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Status</p>
                <p className="text-lg font-bold text-white mt-1">
                  {tripActive ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" /> On Route
                    </span>
                  ) : (
                    <span className="text-white/50 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white/30" /> Idle
                    </span>
                  )}
                </p>
                <p className="text-white/40 text-xs mt-1">{tripActive ? 'Bus is currently moving' : 'Bus has not started yet'}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${tripActive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white/5 border border-white/10'}`}>
                <Navigation className={`w-5 h-5 ${tripActive ? 'text-emerald-400' : 'text-white/30'}`} />
              </div>
            </div>
          </div>

          <div className="glass-card-hover p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Distance</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {tripActive && myStopEta ? `${myStopEta.distance} km` : '--'}
                </p>
                <p className="text-white/40 text-xs mt-1">To your {routeMode === 'morning' ? 'pickup' : 'drop'} stop</p>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Map + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" /> Live Bus Location
            </h3>
            <MapView
              height="400px"
              busLocations={busLocation ? [{ id: bus?.id, number: bus?.number, lat: busLocation.lat, lng: busLocation.lng, isActive: true, speed: busLocation.speed }] : []}
              stops={displayStops}
              routePath={displayStops.map(s => [s.lat, s.lng])}
              flyToPosition={busLocation ? [busLocation.lat, busLocation.lng] : displayStops[0] ? [displayStops[0].lat, displayStops[0].lng] : null}
            />
            {!tripActive && (
              <div className="mt-3 p-3 bg-white/5 rounded-xl text-center text-white/40 text-sm">
                <Clock className="w-5 h-5 mx-auto mb-1 opacity-50" />
                Bus location will appear here when the trip starts
              </div>
            )}
          </div>

          {/* Pickup Timeline */}
          <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Route className="w-4 h-4 text-primary-400" />
              {routeMode === 'morning' ? 'Morning Route' : 'Evening Route'}
            </h3>
            <div className="space-y-0">
              {displayStops.map((stop, i) => {
                const isMyStop = stop.name === (routeMode === 'morning' ? profile?.pickupStop : profile?.pickupStop);
                const eta = etas.find(e => e.stopName === stop.name);
                const isPassed = tripActive && eta && eta.eta <= 0;

                return (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isPassed ? 'bg-emerald-500 border-emerald-500' :
                        isMyStop ? 'bg-primary-500 border-primary-500 animate-pulse-soft' :
                        'bg-transparent border-white/20'
                      }`}>
                        {isPassed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      {i < displayStops.length - 1 && (
                        <div className={`w-0.5 h-12 ${isPassed ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className={`text-sm font-medium ${isMyStop ? 'text-primary-400' : isPassed ? 'text-emerald-400' : 'text-white/70'}`}>
                        {stop.name}
                        {isMyStop && <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">Your Stop</span>}
                      </p>
                      {tripActive && eta && (
                        <p className="text-xs text-white/40 mt-0.5">
                          {isPassed ? '✓ Passed' : `~${eta.eta} min • ${eta.distance} km`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
