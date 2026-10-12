import React, { useState } from 'react';
import { MapPin, Navigation, Search, Check, ChevronDown } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { SAMPLE_CITIES } from '../../utils/haversine';
import { useToast } from '../../context/ToastContext';

interface LocationPickerProps {
  showRadiusSelector?: boolean;
  compact?: boolean;
  onLocationChanged?: () => void;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  showRadiusSelector = true,
  compact = false,
  onLocationChanged,
}) => {
  const { userLocation, setUserLocation, searchRadius, setSearchRadius, detectCurrentLocation } = useData();
  const { showToast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const radiusOptions = [2, 5, 10, 20, 50];

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    const res = await detectCurrentLocation();
    setIsDetecting(false);
    if (res.success) {
      showToast('GPS Location Detected', res.message, 'success');
      if (onLocationChanged) onLocationChanged();
    } else {
      showToast('Location Permission', res.message, 'warning');
    }
  };

  const handleSelectPreset = (preset: typeof SAMPLE_CITIES[0]) => {
    setUserLocation({
      latitude: preset.lat,
      longitude: preset.lng,
      name: `${preset.name}`,
      address: `${preset.area}, ${preset.city}`,
    });
    setIsDropdownOpen(false);
    if (onLocationChanged) onLocationChanged();
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Search against presets or assign pseudo coordinates close to city center
    const query = searchInput.toLowerCase();
    const matched = SAMPLE_CITIES.find(
      (c) => c.name.toLowerCase().includes(query) || c.area.toLowerCase().includes(query)
    );

    if (matched) {
      handleSelectPreset(matched);
    } else {
      // Create user specified location
      setUserLocation({
        latitude: 37.7749 + (Math.random() - 0.5) * 0.05,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.05,
        name: searchInput.trim(),
        address: `${searchInput.trim()}, Metropolis Hub`,
      });
      showToast('Location Set', `Updated search point to "${searchInput.trim()}"`, 'info');
      if (onLocationChanged) onLocationChanged();
    }
    setSearchInput('');
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#245C45] bg-[#EBF5ED] hover:bg-[#d8edd9] rounded-lg transition-colors border border-[#6FAF78]/30"
          >
            <MapPin className="w-3.5 h-3.5 text-[#245C45]" />
            <span className="max-w-[130px] truncate">{userLocation.name || 'Metropolis'}</span>
            <ChevronDown className="w-3 h-3 text-[#53645B]" />
          </button>

          {isDropdownOpen && (
            <div className="absolute left-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-[#E5EAE7] py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#8E9F96] uppercase tracking-wider">
                Select City Hub Preset
              </div>
              {SAMPLE_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleSelectPreset(city)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-[#F8F8F2] flex items-center justify-between transition-colors text-[#25312B]"
                >
                  <div>
                    <div className="font-medium">{city.name}</div>
                    <div className="text-[10px] text-[#53645B]">{city.area}</div>
                  </div>
                  {userLocation.name === city.name && <Check className="w-3.5 h-3.5 text-[#245C45]" />}
                </button>
              ))}
              <div className="p-2 border-t border-[#E5EAE7] mt-1">
                <button
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="w-full py-1.5 px-2 bg-[#245C45] text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-[#1B4534] transition-colors"
                >
                  <Navigation className="w-3 h-3" />
                  {isDetecting ? 'Detecting...' : 'Use My GPS Location'}
                </button>
              </div>
            </div>
          )}
        </div>

        {showRadiusSelector && (
          <div className="flex items-center gap-1 bg-[#F8F8F2] border border-[#E5EAE7] rounded-lg p-1 text-xs">
            <span className="text-[10px] font-medium text-[#53645B] px-1.5">Radius:</span>
            {radiusOptions.slice(0, 3).map((r) => (
              <button
                key={r}
                onClick={() => setSearchRadius(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                  searchRadius === r
                    ? 'bg-[#245C45] text-white shadow-xs'
                    : 'text-[#53645B] hover:text-[#25312B]'
                }`}
              >
                {r}km
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-[#E5EAE7] w-full">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search input form */}
        <form onSubmit={handleManualSearch} className="flex-1 relative flex items-center">
          <div className="absolute left-3.5 text-[#8E9F96]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter city, neighborhood, or PIN code..."
            className="w-full pl-10 pr-24 py-3 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] placeholder-[#8E9F96] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45] transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 px-3.5 py-1.5 bg-[#245C45] text-white text-xs font-semibold rounded-lg hover:bg-[#1B4534] transition-colors"
          >
            Search
          </button>
        </form>

        {/* GPS location button */}
        <button
          onClick={handleDetectLocation}
          disabled={isDetecting}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#EBF5ED] text-[#245C45] hover:bg-[#d9edd9] border border-[#6FAF78]/40 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95"
        >
          <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
          <span>{isDetecting ? 'Detecting Location...' : 'Use My Current Location'}</span>
        </button>

        {/* Radius selector */}
        {showRadiusSelector && (
          <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl p-1.5 shrink-0">
            <span className="text-xs font-semibold text-[#53645B] px-2">Radius:</span>
            <div className="flex items-center gap-1">
              {radiusOptions.map((rad) => (
                <button
                  key={rad}
                  onClick={() => setSearchRadius(rad)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    searchRadius === rad
                      ? 'bg-[#245C45] text-white shadow-xs'
                      : 'text-[#53645B] hover:text-[#25312B] hover:bg-white'
                  }`}
                >
                  {rad}km
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Current location display & Quick Presets */}
      <div className="mt-3 pt-3 border-t border-[#F8F8F2] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[#53645B]">
          <MapPin className="w-3.5 h-3.5 text-[#245C45]" />
          <span>Active center:</span>
          <span className="font-semibold text-[#25312B]">{userLocation.name}</span>
          <span className="text-[#8E9F96]">({searchRadius} km radius active)</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[#8E9F96]">Quick areas:</span>
          {SAMPLE_CITIES.slice(0, 3).map((city) => (
            <button
              key={city.name}
              onClick={() => handleSelectPreset(city)}
              className="px-2 py-0.5 rounded-md bg-[#F8F8F2] hover:bg-[#EBF5ED] text-[#53645B] hover:text-[#245C45] text-[11px] font-medium transition-colors border border-transparent hover:border-[#6FAF78]/30"
            >
              {city.area}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
