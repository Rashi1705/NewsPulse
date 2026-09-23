import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Header from './components/Header';
import TopSections from './components/TopSections';
import SourceFilter from './components/SourceFilter';
import TimelineView from './components/TimelineView';
import ClusterDrawer from './components/ClusterDrawer';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('newspulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  const [selectedCluster, setSelectedCluster] = useState(null);
  const [clusterDetails, setClusterDetails] = useState(null);
  const [clusterLoading, setClusterLoading] = useState(false);

  const [isIngesting, setIsIngesting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  const fetchTimeline = useCallback(async () => {
    try {
      setError(null);
      const url =
        selectedSource === 'all'
          ? '/timeline?limit=60'
          : `/timeline?source=${encodeURIComponent(selectedSource)}&limit=60`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setClusters(json.data);
      }
    } catch (err) {
      console.error('Timeline fetch error:', err);
      setError('Could not connect to the backend server. Make sure it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  }, [selectedSource]);

  useEffect(() => {
    setLoading(true);
    fetchTimeline();
  }, [fetchTimeline]);

  useEffect(() => {
    if (!selectedCluster) {
      setClusterDetails(null);
      return;
    }

    let active = true;
    setClusterLoading(true);

    fetch(`/clusters/${selectedCluster.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (active && json.success) setClusterDetails(json.data);
      })
      .catch((e) => console.error('Cluster detail fetch error:', e))
      .finally(() => { if (active) setClusterLoading(false); });

    return () => { active = false; };
  }, [selectedCluster]);

  const handleTriggerIngest = async () => {
    try {
      setIsIngesting(true);

      const res = await fetch('/ingest/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerType: 'manual' }),
      });

      const json = await res.json();
      if (json.success && json.jobId) {
        setCurrentJobId(json.jobId);
      } else {
        setTimeout(() => {
          fetchTimeline();
          setIsIngesting(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Ingest trigger error:', err);
      setIsIngesting(false);
    }
  };

  useEffect(() => {
    if (!isIngesting || !currentJobId) return;

    const id = setInterval(async () => {
      try {
        const res = await fetch(`/ingest/status/${currentJobId}`);
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.status === 'completed' || json.data.status === 'failed') {
            setIsIngesting(false);
            setCurrentJobId(null);
            clearInterval(id);
            fetchTimeline();
          }
        }
      } catch (e) {
        console.error('Job poll error:', e);
      }
    }, 2000);

    return () => clearInterval(id);
  }, [isIngesting, currentJobId, fetchTimeline]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('portal');
  };

  const handleLogout = () => {
    localStorage.removeItem('newspulse_user');
    setUser(null);
    setCurrentView('landing');
  };

  const sourceCounts = useMemo(() => {
    const counts = { all: clusters.length };
    clusters.forEach((c) => {
      (c.sources || []).forEach((s) => {
        counts[s] = (counts[s] || 0) + 1;
      });
    });
    return counts;
  }, [clusters]);

  const displayedClusters = useMemo(() => {
    let result = [...clusters];

    if (selectedSection !== 'all') {
      const matchers = {
        national: (c) => /india|delhi|mumbai|state|centre|bjp|congress|court|police|cabinet|bharat|minister/i.test(`${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`),
        politics: (c) => /election|poll|vote|party|parliament|leader|modi|rahul|assembly|mp|mla|government/i.test(`${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`),
        business: (c) => /business|market|sensex|nifty|economy|bank|rbi|rupee|stock|trade|inflation|gdp/i.test(`${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`),
        world: (c) => /world|global|us|usa|china|russia|ukraine|israel|iran|un|gaza|international/i.test(`${c.label || ''} ${(c.keywords || []).join(' ')} ${(c.sampleArticles || []).map(a => a.title).join(' ')}`),
        cross_source: (c) => c.isCrossSource || (c.articleCount && c.articleCount > 1),
      };
      if (matchers[selectedSection]) {
        result = result.filter(matchers[selectedSection]);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.label?.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.toLowerCase().includes(q)) ||
          c.sampleArticles?.some((a) => a.title?.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'articles') result.sort((a, b) => b.articleCount - a.articleCount);
    else if (sortBy === 'intensity') result.sort((a, b) => (b.intensity || 1) - (a.intensity || 1));
    else result.sort((a, b) => (b.endTimestamp || 0) - (a.endTimestamp || 0));

    return result;
  }, [clusters, selectedSection, searchQuery, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">

      {currentView === 'landing' ? (
        <LandingPage
          onEnterPortal={() => setCurrentView('portal')}
          onOpenAuth={() => setAuthModalOpen(true)}
          user={user}
        />
      ) : (
        <div className="min-h-screen bg-[#0d0e12] text-gray-100 flex flex-col">
          <Header
            isIngesting={isIngesting}
            onTriggerIngest={handleTriggerIngest}
            onBackToLanding={() => setCurrentView('landing')}
            user={user}
            onLogout={handleLogout}
            onOpenAuth={() => setAuthModalOpen(true)}
            clusters={clusters}
            onSelectCluster={setSelectedCluster}
          />

          <TopSections
            clusters={clusters}
            selectedSection={selectedSection}
            onSelectSection={setSelectedSection}
          />

          <SourceFilter
            selectedSource={selectedSource}
            onSelectSource={setSelectedSource}
            sourceCounts={sourceCounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <main className="flex-1 flex flex-col">
            {loading && clusters.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-24 text-gray-400">
                <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mr-3" />
                Loading today's stories...
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-rose-600 font-semibold">{error}</p>
              </div>
            ) : (
              <TimelineView
                clusters={displayedClusters}
                selectedClusterId={selectedCluster?.id}
                onSelectCluster={setSelectedCluster}
              />
            )}
          </main>

          {selectedCluster && (
            <ClusterDrawer
              cluster={selectedCluster}
              clusterDetails={clusterDetails}
              loading={clusterLoading}
              onClose={() => setSelectedCluster(null)}
            />
          )}
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
