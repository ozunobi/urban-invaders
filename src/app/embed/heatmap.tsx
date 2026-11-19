import HeatmapEmbed from '../../embed/heatmap-embed';
import { useEffect, useState } from 'react';

export default function HeatmapEmbedPage() {
  const [params, setParams] = useState({
    lat: 14.55,
    lng: 121.1,
    zoom: 10,
    maxReports: 1000,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      setParams({
        lat: searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : 14.55,
        lng: searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : 121.1,
        zoom: searchParams.get('zoom') ? parseInt(searchParams.get('zoom')!) : 10,
        maxReports: searchParams.get('maxReports') ? parseInt(searchParams.get('maxReports')!) : 1000,
      });
    }
  }, []);

  return (
    <HeatmapEmbed
      supabaseUrl={process.env.EXPO_PUBLIC_SUPABASE_URL || ''}
      supabaseKey={process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}
      centerLat={params.lat}
      centerLng={params.lng}
      zoom={params.zoom}
      maxReports={params.maxReports}
    />
  );
}
