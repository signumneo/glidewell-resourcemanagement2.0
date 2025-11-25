import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ActivityViewGraphWrapper from '../../components/visualizations/ActivityViewGraph';
import { ActivityTableView } from '../../components/tables/ActivityTableView';

export const ActivityViewPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<'table' | 'graph'>('table');

  useEffect(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'table' || viewParam === 'graph') {
      setView(viewParam);
    }
  }, [searchParams]);

  return (
    <div className="w-full h-full">
      {view === 'table' ? <ActivityTableView /> : <ActivityViewGraphWrapper />}
    </div>
  );
};
