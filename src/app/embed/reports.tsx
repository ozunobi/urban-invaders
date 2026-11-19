import ReportsTableEmbed from '../../embed/reports-table-embed';
import { useEffect, useState } from 'react';

export default function ReportsEmbedPage() {
  const [params, setParams] = useState({
    status: 'accepted' as 'accepted' | 'pending' | 'rejected' | 'all',
    limit: 100,
    columns: ['species', 'location', 'date', 'status'] as Array<'species' | 'location' | 'date' | 'status' | 'description'>,
    details: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const statusParam = (searchParams.get('status') as 'accepted' | 'pending' | 'rejected' | 'all') || 'accepted';
      const columnsParam = (searchParams.get('columns')?.split(',') as Array<'species' | 'location' | 'date' | 'status' | 'description'>) || ['species', 'location', 'date', 'status'];
      
      setParams({
        status: statusParam,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100,
        columns: columnsParam,
        details: searchParams.get('details') !== 'false',
      });
    }
  }, []);

  return (
    <ReportsTableEmbed
      supabaseUrl={process.env.EXPO_PUBLIC_SUPABASE_URL || ''}
      supabaseKey={process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}
      status={params.status}
      limit={params.limit}
      columns={params.columns}
      enableDetails={params.details}
    />
  );
}
