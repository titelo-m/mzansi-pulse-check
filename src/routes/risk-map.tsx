// src/routes/risk-map.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, lazy, Suspense } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  AlertTriangle, 
  Building, 
  School, 
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Flame,
  Check,
  Flag,
  X,
  Users,
  Loader2,
  Search
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Dynamically import Leaflet components (client-side only)
const MapContainer = lazy(() => import('react-leaflet').then(mod => ({ default: mod.MapContainer })));
const TileLayer = lazy(() => import('react-leaflet').then(mod => ({ default: mod.TileLayer })));
const CircleMarker = lazy(() => import('react-leaflet').then(mod => ({ default: mod.CircleMarker })));
const Popup = lazy(() => import('react-leaflet').then(mod => ({ default: mod.Popup })));

export const Route = createFileRoute("/risk-map")({
  head: () => ({
    meta: [
      { title: "Community Risk Map — MzansiPulse" },
      {
        name: "description",
        content:
          "Anonymous community reporting of substance abuse hotspots in Tshwane.",
      },
    ],
  }),
  component: RiskMap,
});

// Types
interface Report {
  id: string;
  location: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  timestamp: Date;
  verified: boolean;
  risk: 'high' | 'medium' | 'low';
  confidence: number;
}

// Tshwane coordinates
const TSHWANE_CENTER: [number, number] = [-25.7479, 28.2293];

// Simple geocoding - map common Tshwane locations to coordinates
const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  "mamelodi": { lat: -25.7039, lng: 28.4167 },
  "mamelodi cbd": { lat: -25.7039, lng: 28.4167 },
  "mamelodi taxi rank": { lat: -25.7039, lng: 28.4167 },
  "mamelodi shopping centre": { lat: -25.7039, lng: 28.4167 },
  "hammanskraal": { lat: -25.4000, lng: 28.3333 },
  "hammanskraal clinic": { lat: -25.4000, lng: 28.3333 },
  "hammanskraal taxi rank": { lat: -25.4000, lng: 28.3333 },
  "atteridgeville": { lat: -25.7333, lng: 28.1000 },
  "atteridgeville high school": { lat: -25.7333, lng: 28.1000 },
  "atteridgeville clinic": { lat: -25.7333, lng: 28.1000 },
  "soshanguve": { lat: -25.5000, lng: 28.3333 },
  "soshanguve taxi rank": { lat: -25.5000, lng: 28.3333 },
  "soshanguve clinic": { lat: -25.5000, lng: 28.3333 },
  "ga-rankuwa": { lat: -25.6000, lng: 27.9833 },
  "ga-rankuwa taxi rank": { lat: -25.6000, lng: 27.9833 },
  "ga-rankuwa clinic": { lat: -25.6000, lng: 27.9833 },
  "pretoria west": { lat: -25.8000, lng: 28.1667 },
  "pretoria west park": { lat: -25.8000, lng: 28.1667 },
  "pretoria west clinic": { lat: -25.8000, lng: 28.1667 },
  "pretoria cbd": { lat: -25.7479, lng: 28.2293 },
  "pretoria": { lat: -25.7479, lng: 28.2293 },
  "centurion": { lat: -25.8611, lng: 28.1900 },
  "centurion clinic": { lat: -25.8611, lng: 28.1900 },
  "bronkhorstspruit": { lat: -25.8000, lng: 28.7500 },
  "cullinan": { lat: -25.6833, lng: 28.5167 },
  "tshwane": { lat: -25.7479, lng: 28.2293 },
};

// Default reports to seed the map
const DEFAULT_REPORTS: Report[] = [
  {
    id: '1',
    location: "Mamelodi CBD",
    lat: -25.7039,
    lng: 28.4167,
    type: "Suspected Drug Dealing",
    description: "Young men gathering at night near taxi rank. Suspected drug dealing activity.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    verified: true,
    risk: 'high',
    confidence: 3
  },
  {
    id: '2',
    location: "Hammanskraal",
    lat: -25.4000,
    lng: 28.3333,
    type: "Abandoned Building",
    description: "Abandoned building being used for drug consumption.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    verified: true,
    risk: 'high',
    confidence: 2
  },
  {
    id: '3',
    location: "Atteridgeville High School",
    lat: -25.7333,
    lng: 28.1000,
    type: "Near School",
    description: "Students using substances during lunch breaks near school.",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    verified: false,
    risk: 'medium',
    confidence: 1
  },
  {
    id: '4',
    location: "Soshanguve Taxi Rank",
    lat: -25.5000,
    lng: 28.3333,
    type: "Substance Abuse Hotspot",
    description: "Multiple reports of substance abuse at the taxi rank.",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    verified: true,
    risk: 'medium',
    confidence: 2
  },
  {
    id: '5',
    location: "Ga-Rankuwa Taxi Rank",
    lat: -25.6000,
    lng: 27.9833,
    type: "Substance Abuse Hotspot",
    description: "Recurring substance abuse incidents at the taxi rank.",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    verified: true,
    risk: 'high',
    confidence: 2
  },
  {
    id: '6',
    location: "Pretoria West Park",
    lat: -25.8000,
    lng: 28.1667,
    type: "Community Concern",
    description: "Community members concerned about drug use at the park.",
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    verified: false,
    risk: 'low',
    confidence: 1
  },
];

const RISK_COLORS = {
  high: { color: "red", hex: "#ef4444", label: "High Risk" },
  medium: { color: "yellow", hex: "#eab308", label: "Medium Risk" },
  low: { color: "green", hex: "#22c55e", label: "Low Risk" }
};

// Report types with their translation keys
const REPORT_TYPES = [
  { value: "Suspected Drug Dealing", key: "riskMap.types.suspected_dealing" },
  { value: "Substance Abuse Hotspot", key: "riskMap.types.hotspot" },
  { value: "Near School", key: "riskMap.types.near_school" },
  { value: "Abandoned Building Used for Drugs", key: "riskMap.types.abandoned_building" },
  { value: "Recurring Incident", key: "riskMap.types.recurring" },
  { value: "Other Concern", key: "riskMap.types.other" },
];

const MOTIVATIONAL_KEYS = [
  "riskMap.motivational1",
  "riskMap.motivational2",
  "riskMap.motivational3",
  "riskMap.motivational4",
  "riskMap.motivational5",
  "riskMap.motivational6",
  "riskMap.motivational7",
  "riskMap.motivational8",
];

// Map component
function MapComponent({ reports, onSelectReport }: { reports: Report[], onSelectReport: (report: Report) => void }) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    import('leaflet/dist/leaflet.css');
    import('leaflet').then(L => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading map...</span>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    return RISK_COLORS[risk as keyof typeof RISK_COLORS]?.hex || '#6b7280';
  };

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading map...</span>
      </div>
    }>
      <MapContainer
        center={TSHWANE_CENTER}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {reports.map((report) => {
          const riskColor = getRiskColor(report.risk);
          return (
            <CircleMarker
              key={report.id}
              center={[report.lat, report.lng]}
              radius={12}
              fillColor={riskColor}
              color={riskColor}
              weight={2}
              opacity={0.8}
              fillOpacity={0.6}
              eventHandlers={{
                click: () => onSelectReport(report)
              }}
            >
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-semibold text-foreground">{report.location}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={`font-medium ${
                      report.risk === 'high' ? 'text-red-500' : 
                      report.risk === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {RISK_COLORS[report.risk].label}
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{report.confidence} reports</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {timeAgo(report.timestamp)}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </Suspense>
  );
}

function RiskMap() {
  const { t } = useI18n();
  const [reports, setReports] = useState<Report[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState("map");
  const [isClient, setIsClient] = useState(false);
  
  // Form state
  const [location, setLocation] = useState("");
  const [reportType, setReportType] = useState("");
  const [description, setDescription] = useState("");
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [motivationMessage, setMotivationMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load reports from localStorage or use defaults
  useEffect(() => {
    try {
      const saved = localStorage.getItem('riskmap_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        const reportsWithDates = parsed.map((r: any) => ({
          ...r,
          timestamp: new Date(r.timestamp)
        }));
        setReports(reportsWithDates);
      } else {
        setReports(DEFAULT_REPORTS);
        localStorage.setItem('riskmap_reports', JSON.stringify(DEFAULT_REPORTS));
      }
    } catch (e) {
      setReports(DEFAULT_REPORTS);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (reports.length > 0 && !isLoading) {
      localStorage.setItem('riskmap_reports', JSON.stringify(reports));
    }
  }, [reports, isLoading]);

  // Get coordinates from location name
  const getCoordinates = (locationName: string): { lat: number; lng: number } | null => {
    const key = locationName.toLowerCase().trim();
    if (LOCATION_COORDS[key]) {
      return LOCATION_COORDS[key];
    }
    for (const [locKey, coords] of Object.entries(LOCATION_COORDS)) {
      if (key.includes(locKey) || locKey.includes(key)) {
        return coords;
      }
    }
    return { lat: TSHWANE_CENTER[0], lng: TSHWANE_CENTER[1] };
  };

  // Get translated risk label
  const getRiskLabel = (risk: string) => {
    const labels: Record<string, string> = {
      'high': t('riskMap.highRisk'),
      'medium': t('riskMap.mediumRisk'),
      'low': t('riskMap.lowRisk')
    };
    return labels[risk] || risk;
  };

  // Get translated report type
  const getReportTypeLabel = (type: string) => {
    const found = REPORT_TYPES.find(rt => rt.value === type);
    if (found) {
      return t(found.key);
    }
    return type;
  };

  // Get translated report types for dropdown
  const getReportTypes = () => {
    return REPORT_TYPES.map(rt => ({
      value: rt.value,
      label: t(rt.key)
    }));
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location || !reportType) {
      alert("Please fill in all required fields.");
      return;
    }

    const coords = getCoordinates(location);
    
    const newReport: Report = {
      id: Date.now().toString(),
      location: location,
      lat: coords.lat,
      lng: coords.lng,
      type: reportType,
      description: description || "No description provided.",
      timestamp: new Date(),
      verified: false,
      risk: 'medium',
      confidence: 1
    };

    setReports([newReport, ...reports]);
    
    const randomKey = MOTIVATIONAL_KEYS[Math.floor(Math.random() * MOTIVATIONAL_KEYS.length)];
    setMotivationMessage(t(randomKey));
    setShowSuccess(true);
    
    setLocation("");
    setReportType("");
    setDescription("");
    
    setTimeout(() => {
      setShowSuccess(false);
      setShowReportForm(false);
    }, 3000);
  };

  const getRiskColor = (risk: string) => {
    return RISK_COLORS[risk as keyof typeof RISK_COLORS]?.hex || '#6b7280';
  };

  const totalReports = reports.length;
  const highRiskCount = reports.filter(r => r.risk === 'high').length;
  const nearSchoolCount = reports.filter(r => r.type === 'Near School').length;
  const verifiedCount = reports.filter(r => r.verified).length;

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const reportTypes = getReportTypes();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4">
      {/* Back Link */}
      <div className="mb-4">
        <a href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> {t('riskMap.backHome')}
        </a>
      </div>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/15 p-3">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('riskMap.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('riskMap.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-3 text-center">
          <div className="text-xl font-bold text-foreground">{totalReports}</div>
          <div className="text-xs text-muted-foreground">{t('riskMap.totalReports')}</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
          <div className="text-xl font-bold text-red-500">{highRiskCount}</div>
          <div className="text-xs text-muted-foreground">{t('riskMap.highRiskAreas')}</div>
        </div>
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
          <div className="text-xl font-bold text-yellow-500">{nearSchoolCount}</div>
          <div className="text-xs text-muted-foreground">{t('riskMap.nearSchools')}</div>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
          <div className="text-xl font-bold text-green-500">{verifiedCount}</div>
          <div className="text-xs text-muted-foreground">{t('riskMap.verifiedReports')}</div>
        </div>
      </div>

      {/* Report Button */}
      <div className="mb-4">
        <button
          onClick={() => setShowReportForm(true)}
          className="w-full rounded-xl bg-primary py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="inline h-4 w-4 mr-2" />
          {t('riskMap.reportConcern')}
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("map")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "map" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapPin className="inline h-4 w-4 mr-1.5" />
          {t('riskMap.map')}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "reports" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="inline h-4 w-4 mr-1.5" />
          {t('riskMap.recentReports')}
        </button>
        <button
          onClick={() => setActiveTab("hotspots")}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "hotspots" 
              ? "border-primary text-primary" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame className="inline h-4 w-4 mr-1.5" />
          {t('riskMap.hotspots')}
        </button>
      </div>

      {/* Tab Content - Map */}
      {activeTab === "map" && isClient && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="h-[400px] w-full">
            <MapComponent reports={reports} onSelectReport={setSelectedReport} />
          </div>
          <div className="border-t border-border px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-xs text-muted-foreground">{t('riskMap.highRisk')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-xs text-muted-foreground">{t('riskMap.mediumRisk')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">{t('riskMap.lowRisk')}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {reports.length} {t('riskMap.reports')} • Click markers for details
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "map" && !isClient && (
        <div className="rounded-xl border border-border bg-surface h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">{t('riskMap.loadingMap')}</span>
        </div>
      )}

      {/* Tab Content - Recent Reports */}
      {activeTab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-muted-foreground">{t('riskMap.noReports')}</p>
            </div>
          ) : (
            reports.slice(0, 10).map((report) => {
              const riskColor = getRiskColor(report.risk);
              return (
                <div 
                  key={report.id} 
                  className="rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{report.location}</span>
                        <span 
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            report.risk === 'high' ? 'bg-red-500/10 text-red-500' : 
                            report.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 
                            'bg-green-500/10 text-green-500'
                          }`}
                        >
                          {getRiskLabel(report.risk)}
                        </span>
                        {report.verified && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-500">
                            <Check className="h-3 w-3" /> {t('riskMap.verified')}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{report.description}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timeAgo(report.timestamp)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flag className="h-3 w-3" />
                          {getReportTypeLabel(report.type)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {report.confidence} {t('riskMap.reports')}
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedReport(report); }}
                      className="shrink-0 rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                    >
                      {t('riskMap.view')}
                    </button>
                  </div>
                </div>
              );
            })
          )}
          {reports.length > 10 && (
            <p className="text-center text-xs text-muted-foreground">Showing 10 of {reports.length} {t('riskMap.reports')}</p>
          )}
        </div>
      )}

      {/* Tab Content - Hotspots */}
      {activeTab === "hotspots" && (
        <div className="space-y-3">
          {reports.filter(r => r.confidence >= 2).length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <p className="text-muted-foreground">{t('riskMap.noHotspots')}</p>
            </div>
          ) : (
            reports
              .filter(r => r.confidence >= 2)
              .sort((a, b) => b.confidence - a.confidence)
              .map((loc) => {
                const riskColor = getRiskColor(loc.risk);
                return (
                  <div 
                    key={loc.id} 
                    className="rounded-xl border border-border bg-surface p-4 hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(loc)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${riskColor}20` }}
                      >
                        <span className="font-bold text-sm" style={{ color: riskColor }}>{loc.confidence}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{loc.location}</span>
                          <span 
                            className="text-xs font-medium"
                            style={{ color: riskColor }}
                          >
                            {getRiskLabel(loc.risk)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{loc.confidence} {t('riskMap.reports')} • {getReportTypeLabel(loc.type)}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedReport(loc); }}
                        className="shrink-0 rounded-lg border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        {t('riskMap.view')}
                      </button>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setSelectedReport(null)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">{selectedReport.location}</h2>
            </div>
            
            <p className="mt-2 text-sm text-muted-foreground">{selectedReport.description}</p>
            
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('riskMap.riskLevel')}</span>
                <span className={`font-medium ${
                  selectedReport.risk === 'high' ? 'text-red-500' : 
                  selectedReport.risk === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {getRiskLabel(selectedReport.risk)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('riskMap.type')}</span>
                <span className="text-foreground">{getReportTypeLabel(selectedReport.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('riskMap.reports')}</span>
                <span className="text-foreground">{selectedReport.confidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('riskMap.reported')}</span>
                <span className="text-foreground">{timeAgo(selectedReport.timestamp)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('riskMap.verified')}</span>
                <span className={selectedReport.verified ? 'text-green-500' : 'text-yellow-500'}>
                  {selectedReport.verified ? `✅ ${t('riskMap.verified')}` : `⏳ ${t('riskMap.pending')}`}
                </span>
              </div>
            </div>

            <div className="mt-4 flex gap-2 border-t border-border pt-4">
              <button 
                onClick={() => {
                  setSelectedReport(null);
                  setShowReportForm(true);
                }}
                className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Flag className="inline h-4 w-4 mr-1.5" /> {t('riskMap.reportSimilar')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
            <button
              onClick={() => setShowReportForm(false)}
              className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            {showSuccess ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-500/15 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{t('riskMap.thankYou')}</h3>
                <p className="mt-2 text-lg font-semibold text-primary">{motivationMessage}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t('riskMap.yourReportHelps')}</p>
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setShowReportForm(false);
                  }}
                  className="mt-4 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {t('riskMap.done')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">{t('riskMap.reportConcern')}</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('riskMap.anonymousNote')}
                </p>

                <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">{t('riskMap.location')} *</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={t('riskMap.locationPlaceholder')}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      required
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Search className="inline h-3 w-3 mr-1" />
                      {t('riskMap.autoLocate')}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">{t('riskMap.typeOfConcern')} *</label>
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      required
                    >
                      <option value="">{t('riskMap.selectType')}</option>
                      {reportTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">{t('riskMap.description')}</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('riskMap.brieflyDescribe')}
                      rows={3}
                      className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>

                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3">
                    <p className="text-xs text-muted-foreground">
                      <Shield className="inline h-3 w-3 mr-1" />
                      {t('riskMap.anonymousNote')}
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="inline h-4 w-4 mr-1.5" />
                    {t('riskMap.submitReport')}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}