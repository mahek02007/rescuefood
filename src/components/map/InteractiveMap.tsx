import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Donation, LocationCoordinates } from '../../types';
import { calculateDistance, formatDistance } from '../../utils/haversine';

interface InteractiveMapProps {
  donations: Donation[];
  centerLocation: LocationCoordinates;
  radiusKm?: number;
  onSelectDonation?: (donation: Donation) => void;
  height?: string;
  showVolunteerPins?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  donations,
  centerLocation,
  radiusKm = 10,
  onSelectDonation,
  height = '420px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [centerLocation.latitude, centerLocation.longitude],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center, radius circle, and markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setView([centerLocation.latitude, centerLocation.longitude], radiusKm <= 5 ? 14 : radiusKm <= 15 ? 13 : 11);

    // Update or create Radius Circle
    if (circleRef.current) {
      circleRef.current.remove();
    }
    const circle = L.circle([centerLocation.latitude, centerLocation.longitude], {
      color: '#245C45',
      fillColor: '#6FAF78',
      fillOpacity: 0.12,
      radius: radiusKm * 1000,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);
    circleRef.current = circle;

    // Clear previous markers
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
    }

    // Add Center / User Pin
    const userPinIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #F4A261;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(244,162,97,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const userMarker = L.marker([centerLocation.latitude, centerLocation.longitude], { icon: userPinIcon });
    userMarker.bindPopup(`
      <div style="font-family: Inter, sans-serif; padding: 4px;">
        <span style="display:inline-block; font-size: 10px; font-weight: 700; color: #F4A261; text-transform: uppercase;">Selected Center</span>
        <h4 style="margin: 2px 0 4px; font-size: 13px; font-weight: 700; color: #25312B;">${centerLocation.name || 'Your Location'}</h4>
        <p style="margin:0; font-size: 11px; color: #53645B;">Search Radius: ${radiusKm} km</p>
      </div>
    `);
    layerGroupRef.current?.addLayer(userMarker);

    // Add Donation Markers
    donations.forEach((donation) => {
      const dist = calculateDistance(
        centerLocation.latitude,
        centerLocation.longitude,
        donation.latitude,
        donation.longitude
      );

      const isAvailable = donation.status === 'Available';
      const isClaimed = donation.status === 'Claimed';
      const isScheduled = donation.status === 'Pickup Scheduled';

      const pinColor = isAvailable ? '#245C45' : isClaimed ? '#F4A261' : isScheduled ? '#3B82F6' : '#8E9F96';
      const iconSymbol = isAvailable ? '🍲' : isClaimed ? '🤝' : isScheduled ? '🚚' : '✓';

      const donationPinIcon = L.divIcon({
        className: 'custom-donation-marker',
        html: `
          <div style="
            width: 36px;
            height: 36px;
            background: ${pinColor};
            border: 2.5px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s ease;
          ">
            ${iconSymbol}
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([donation.latitude, donation.longitude], { icon: donationPinIcon });

      const popupContent = document.createElement('div');
      popupContent.style.fontFamily = 'Inter, sans-serif';
      popupContent.style.minWidth = '190px';
      popupContent.innerHTML = `
        <div style="margin-bottom: 6px;">
          <span style="
            display: inline-block;
            font-size: 9px;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            background: ${isAvailable ? '#EBF5ED' : '#FEF3C7'};
            color: ${isAvailable ? '#245C45' : '#D97706'};
            text-transform: uppercase;
          ">
            ${donation.status}
          </span>
          <span style="font-size: 11px; font-weight: 600; color: #53645B; float: right;">
            ${formatDistance(dist)} away
          </span>
        </div>
        <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #25312B; line-height: 1.3;">
          ${donation.title}
        </h4>
        <p style="margin: 0 0 6px; font-size: 11px; color: #53645B;">
          ${donation.quantityValue} ${donation.quantityUnit} · Serves ~${donation.estimatedPeopleServed} people
        </p>
        <p style="margin: 0 0 8px; font-size: 10px; color: #8E9F96;">
          📍 ${donation.area}
        </p>
        <button id="view-don-${donation.id}" style="
          width: 100%;
          background: #245C45;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        ">
          View Donation Details
        </button>
      `;

      popupContent.querySelector(`#view-don-${donation.id}`)?.addEventListener('click', () => {
        if (onSelectDonation) onSelectDonation(donation);
      });

      marker.bindPopup(popupContent);
      layerGroupRef.current?.addLayer(marker);
    });
  }, [centerLocation, radiusKm, donations, onSelectDonation]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5EAE7] shadow-sm bg-white">
      {/* Map Header / Legend Bar */}
      <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 border-b border-[#E5EAE7] flex flex-wrap items-center justify-between gap-3 text-xs z-20 relative">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#25312B] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#245C45] animate-ping" />
            Interactive Geographic Radius Map
          </span>
          <span className="text-[#8E9F96]">|</span>
          <span className="text-[#53645B]">Center: {centerLocation.name} ({radiusKm} km radius)</span>
        </div>

        <div className="flex items-center gap-4 text-[#53645B]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#245C45] inline-block" /> Available Food
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F4A261] inline-block" /> Claimed / In Transit
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#F4A261] border border-white inline-block" /> Your Location
          </span>
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-10" />

      {/* Demo map disclaimer badge */}
      <div className="absolute bottom-2 left-2 z-20 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] text-[#53645B] border border-[#E5EAE7] shadow-xs">
        <span className="font-semibold text-[#245C45]">Simulated coordinates</span> for high accuracy demo matching
      </div>
    </div>
  );
};
