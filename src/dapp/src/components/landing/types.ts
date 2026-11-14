import { HotspotItem } from "./StoryHotspots";

export interface StoryTelemetry {
  label: string;
  value: string;
  status?: "normal" | "active" | "verified" | "warning";
}

export interface StoryChapter {
  id: number;
  key: "earth" | "clouds" | "indonesia" | "canopy" | "orangutan" | "panorama";
  badge: string;
  title: string;
  subtitle: string;
  narrative: string;
  image: string;
  cameraInfo: string;
  hotspots?: HotspotItem[];
  telemetry?: StoryTelemetry[];
  cta?: {
    primaryText: string;
    primaryHref: string;
    secondaryText: string;
    secondaryHref: string;
  };
}
