import type { CSSProperties } from "react";
import type { BpClassification, BpThresholdRow } from "@core/calculators/bp/calculatePediatricBpPercentiles";

const ZONE_COLORS = {
  green: "#22c55e",
  yellow: "#eab308",
  lightRed: "#f87171",
  deepRed: "#991b1b",
} as const;

const TICK_STACK_ROW_PX = 22;
const TICK_COLLISION_GAP_PCT = 8;
const TICK_STEM_PX = 10;
const TICK_ARROW_PX = 5;
const LABEL_BLOCK_PX = 28;

/** Shared visual zone boundaries (% of bar width) — SBP and DBP align vertically. */
const VISUAL_P90 = 60;
const VISUAL_P95 = 74;
const VISUAL_P95PLUS12 = 86;
const VISUAL_P50 = 36;

interface VisualZoneWidths {
  green: number;
  yellow: number;
  lightRed: number;
  deepRed: number;
}

function sharedVisualZoneWidths(): VisualZoneWidths {
  return {
    green: VISUAL_P90,
    yellow: VISUAL_P95 - VISUAL_P90,
    lightRed: VISUAL_P95PLUS12 - VISUAL_P95,
    deepRed: 100 - VISUAL_P95PLUS12,
  };
}

function tierMarkerPct(tierKey: string): number {
  switch (tierKey) {
    case "min":
      return 0;
    case "p50":
      return VISUAL_P50;
    case "p90":
      return VISUAL_P90;
    case "p95":
      return VISUAL_P95;
    case "p95plus12":
      return VISUAL_P95PLUS12;
    case "max":
      return 100;
    default:
      return 50;
  }
}

function lerpVisualPct(v0: number, p0: number, v1: number, p1: number, value: number): number {
  if (v1 === v0) return p1;
  return p0 + ((value - v0) / (v1 - v0)) * (p1 - p0);
}

function patientVisualPct(value: number, scale: ScaleSpec): number {
  const { scaleMin, scaleMax, p50, p90, p95, p95plus12 } = scale;

  if (value <= scaleMin) return 0;
  if (value >= scaleMax) return 100;

  if (value < p50) {
    return lerpVisualPct(scaleMin, 0, p50, VISUAL_P50, value);
  }
  if (value < p90) {
    return lerpVisualPct(p50, VISUAL_P50, p90, VISUAL_P90, value);
  }

  if (p95 <= p90) {
    if (value < p95plus12) {
      return lerpVisualPct(p90, VISUAL_P90, p95plus12, VISUAL_P95PLUS12, value);
    }
    return lerpVisualPct(p95plus12, VISUAL_P95PLUS12, scaleMax, 100, value);
  }

  if (value < p95) {
    return lerpVisualPct(p90, VISUAL_P90, p95, VISUAL_P95, value);
  }
  if (value < p95plus12) {
    return lerpVisualPct(p95, VISUAL_P95, p95plus12, VISUAL_P95PLUS12, value);
  }
  return lerpVisualPct(p95plus12, VISUAL_P95PLUS12, scaleMax, 100, value);
}

const GRAPHIC_SCALE = 0.94;
const GRAPHIC_INSET_PX = 14;
const OVERLAP_BADGE_GAP_PX = 36;
const OVERLAP_LABEL_CLEARANCE_PX = 4;

type ZoneKey = keyof typeof ZONE_COLORS;

interface PatientBadgeStyle {
  backgroundColor: string;
  color: string;
  borderColor: string;
  arrowColor: string;
}

function classificationToZone(c: BpClassification): ZoneKey {
  switch (c) {
    case "normal":
      return "green";
    case "elevated":
      return "yellow";
    case "stage1":
      return "lightRed";
    case "stage2":
      return "deepRed";
  }
}

function patientBadgeStyle(c: BpClassification): PatientBadgeStyle {
  const zone = classificationToZone(c);
  const backgroundColor = ZONE_COLORS[zone];

  switch (zone) {
    case "green":
      return {
        backgroundColor: "#15803d",
        color: "#ffffff",
        borderColor: "#14532d",
        arrowColor: "#15803d",
      };
    case "yellow":
      return {
        backgroundColor,
        color: "#422006",
        borderColor: "#a16207",
        arrowColor: "#a16207",
      };
    case "lightRed":
      return {
        backgroundColor,
        color: "#450a0a",
        borderColor: "#dc2626",
        arrowColor: "#dc2626",
      };
    case "deepRed":
      return {
        backgroundColor,
        color: "#ffffff",
        borderColor: "#450a0a",
        arrowColor: "#991b1b",
      };
  }
}

interface ScaleSpec {
  scaleMin: number;
  scaleMax: number;
  p50: number;
  p90: number;
  p95: number;
  p95plus12: number;
}

interface RawTick {
  key: string;
  label: string;
  value: number;
  pct: number;
}

interface TickCluster {
  keys: string[];
  labels: string[];
  value: number;
  pct: number;
  stackRow: number;
  isPatient?: boolean;
  edgeAlign?: "left" | "right";
}

interface OverlapMarker {
  type: "overlap";
  targetPct: number;
  percentile: TickCluster;
  patient: TickCluster;
  stackRow: number;
}

interface SingleMarker {
  type: "single";
  cluster: TickCluster;
}

type PlaneMarker = SingleMarker | OverlapMarker;

function getThresholds(thresholds: BpThresholdRow[]) {
  const p50 = thresholds.find((t) => t.tierKey === "p50")!;
  const p90 = thresholds.find((t) => t.tierKey === "p90")!;
  const p95 = thresholds.find((t) => t.tierKey === "p95")!;
  const p95plus12 = thresholds.find((t) => t.tierKey === "p95plus12")!;
  return { p50, p90, p95, p95plus12 };
}

function buildScale(
  patientValue: number,
  p50: number,
  p90: number,
  p95: number,
  p95plus12: number,
): ScaleSpec {
  const scaleMin = Math.min(p50, patientValue) - Math.max(8, Math.round(p50 * 0.08));
  const scaleMax = Math.max(p95plus12, patientValue) + Math.max(8, Math.round(p95plus12 * 0.06));
  return { scaleMin, scaleMax, p50, p90, p95, p95plus12 };
}

function assignClusterStackRows(clusters: TickCluster[]): void {
  const sorted = [...clusters].sort((a, b) => a.pct - b.pct);
  for (const cluster of sorted) {
    let row = 0;
    for (const other of sorted) {
      if (other === cluster) continue;
      if (Math.abs(cluster.pct - other.pct) < TICK_COLLISION_GAP_PCT) {
        row = Math.max(row, other.stackRow + 1);
      }
    }
    cluster.stackRow = Math.min(row, 2);
  }
}

function buildAxisClusters(scale: ScaleSpec, patientValue: number): TickCluster[] {
  const tierTicks: RawTick[] = [
    { key: "min", label: "min", value: Math.round(scale.scaleMin), pct: 0 },
    { key: "p50", label: "50th", value: scale.p50, pct: tierMarkerPct("p50") },
    { key: "p90", label: "90th", value: scale.p90, pct: tierMarkerPct("p90") },
    { key: "p95", label: "95th", value: scale.p95, pct: tierMarkerPct("p95") },
    {
      key: "p95plus12",
      label: "95th+12",
      value: scale.p95plus12,
      pct: tierMarkerPct("p95plus12"),
    },
    { key: "max", label: "max", value: Math.round(scale.scaleMax), pct: 100 },
  ];

  const clusters: TickCluster[] = tierTicks.map((tick) => {
    const cluster: TickCluster = {
      keys: [tick.key],
      labels: [tick.label],
      value: tick.value,
      pct: tick.pct,
      stackRow: 0,
      isPatient: false,
    };

    if (tick.key === "min") {
      cluster.edgeAlign = "left";
      cluster.pct = 0;
    } else if (tick.key === "max") {
      cluster.edgeAlign = "right";
      cluster.pct = 100;
    }

    return cluster;
  });

  clusters.push({
    keys: ["patient"],
    labels: [],
    value: patientValue,
    pct: patientVisualPct(patientValue, scale),
    stackRow: 0,
    isPatient: true,
  });

  assignClusterStackRows(clusters);
  return clusters;
}

function resolvePlaneMarkers(
  clusters: TickCluster[],
  classification: BpClassification,
): PlaneMarker[] {
  const patient = clusters.find((c) => c.isPatient);
  const others = clusters.filter((c) => !c.isPatient);

  if (!patient) {
    return others.map((cluster) => ({ type: "single", cluster }));
  }

  const activeTier = classificationTierKey(classification);
  const match =
    (activeTier
      ? others.find((c) => c.keys.includes(activeTier) && c.value === patient.value)
      : undefined) ?? others.find((c) => c.value === patient.value);

  if (!match) {
    return clusters.map((cluster) => ({ type: "single", cluster }));
  }

  const rest = others.filter((c) => c !== match);
  const overlap: OverlapMarker = {
    type: "overlap",
    targetPct: match.pct,
    percentile: match,
    patient,
    stackRow: Math.max(match.stackRow, patient.stackRow),
  };

  return [...rest.map((cluster) => ({ type: "single" as const, cluster })), overlap];
}

function markerPlaneHeightFromMarkers(markers: PlaneMarker[]): number {
  const maxRow = markers.reduce((max, m) => {
    const row = m.type === "single" ? m.cluster.stackRow : m.stackRow;
    return Math.max(max, row);
  }, 0);
  return maxRow * TICK_STACK_ROW_PX + LABEL_BLOCK_PX + TICK_STEM_PX + TICK_ARROW_PX + 4;
}

function GradientStrip({ zones }: { zones: VisualZoneWidths }) {
  return (
    <div className="flex h-full w-full">
      <div className="h-full" style={{ width: `${zones.green}%`, backgroundColor: ZONE_COLORS.green }} />
      {zones.yellow > 0 && (
        <div className="h-full" style={{ width: `${zones.yellow}%`, backgroundColor: ZONE_COLORS.yellow }} />
      )}
      <div className="h-full" style={{ width: `${zones.lightRed}%`, backgroundColor: ZONE_COLORS.lightRed }} />
      <div className="h-full" style={{ width: `${zones.deepRed}%`, backgroundColor: ZONE_COLORS.deepRed }} />
    </div>
  );
}

function ClusterLabels({
  cluster,
  patientZone,
  forcePatient,
}: {
  cluster: TickCluster;
  patientZone?: BpClassification;
  forcePatient?: boolean;
}) {
  const edgeLabel = cluster.labels[0] === "min" || cluster.labels[0] === "max";
  const isPatient = forcePatient ?? cluster.isPatient;
  const zoneStyle = isPatient && patientZone ? patientBadgeStyle(patientZone) : null;

  const labelContent = (
    <div className="text-center">
      {cluster.labels.map((label) => (
        <span
          key={label}
          className={`block whitespace-nowrap text-[10px] leading-tight ${
            edgeLabel ? "font-semibold text-teal-800" : "text-teal-600"
          }`}
          style={zoneStyle && isPatient ? { color: zoneStyle.color } : undefined}
        >
          {label}
        </span>
      ))}
      {isPatient && (
        <span
          className="block whitespace-nowrap text-[10px] font-semibold leading-tight"
          style={{ color: zoneStyle?.color ?? "#134e4a" }}
        >
          Patient
        </span>
      )}
      <span
        className="block whitespace-nowrap text-[10px] font-bold leading-tight"
        style={{ color: zoneStyle && isPatient ? zoneStyle.color : "#115e59" }}
      >
        {cluster.value}
      </span>
    </div>
  );

  if (isPatient && zoneStyle) {
    return (
      <div
        className="rounded px-1.5 py-0.5 shadow-sm ring-1 ring-inset"
        style={{
          backgroundColor: zoneStyle.backgroundColor,
          color: zoneStyle.color,
          borderColor: zoneStyle.borderColor,
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
        }}
      >
        {labelContent}
      </div>
    );
  }

  if (isPatient) {
    return (
      <span className="whitespace-nowrap rounded bg-teal-900 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
        {cluster.value}
      </span>
    );
  }

  return labelContent;
}

function clusterPositionStyle(cluster: TickCluster): CSSProperties {
  if (cluster.edgeAlign === "left") {
    return { left: 0, transform: "translateX(0)" };
  }
  if (cluster.edgeAlign === "right") {
    return { right: 0, left: "auto", transform: "translateX(0)" };
  }
  return { left: `${cluster.pct}%`, transform: "translateX(-50%)" };
}

function patientArrowColor(cluster: TickCluster, patientZone?: BpClassification): string {
  if (cluster.isPatient && patientZone) {
    return patientBadgeStyle(patientZone).arrowColor;
  }
  return "#14b8a6";
}

function markerKey(marker: PlaneMarker): string {
  if (marker.type === "single") return marker.cluster.keys.join("-");
  return `overlap-${marker.percentile.keys.join("-")}-patient`;
}

function OverlapElbowsDown({
  percentileColor,
  patientColor,
  connectorHeight,
  labelBottom,
}: {
  percentileColor: string;
  patientColor: string;
  connectorHeight: number;
  labelBottom: number;
}) {
  const gap = OVERLAP_BADGE_GAP_PX;
  const leftX = -gap;
  const rightX = gap;
  const svgW = gap * 2 + 8;
  const svgH = connectorHeight;
  const badgeConnectY = svgH - labelBottom + OVERLAP_LABEL_CLEARANCE_PX;
  const elbowY = svgH - TICK_STEM_PX - TICK_ARROW_PX - 2;
  const arrowBaseY = svgH - TICK_ARROW_PX;

  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-1/2 overflow-visible"
      width={svgW}
      height={svgH}
      style={{ transform: "translateX(-50%)" }}
      viewBox={`${leftX - 4} 0 ${svgW} ${svgH}`}
      aria-hidden
    >
      <path
        d={`M ${leftX} ${badgeConnectY} V ${elbowY} H 0 V ${arrowBaseY}`}
        fill="none"
        stroke={percentileColor}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <path
        d={`M ${rightX} ${badgeConnectY} V ${elbowY} H 0 V ${arrowBaseY}`}
        fill="none"
        stroke={patientColor}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${svgH} ${-4},${arrowBaseY} ${4},${arrowBaseY}`}
        fill={patientColor}
      />
    </svg>
  );
}

function OverlapElbowsUp({
  percentileColor,
  patientColor,
  connectorHeight,
  labelTop,
}: {
  percentileColor: string;
  patientColor: string;
  connectorHeight: number;
  labelTop: number;
}) {
  const gap = OVERLAP_BADGE_GAP_PX;
  const leftX = -gap;
  const rightX = gap;
  const svgW = gap * 2 + 8;
  const svgH = connectorHeight;
  const badgeConnectY = labelTop - OVERLAP_LABEL_CLEARANCE_PX;
  const elbowY = TICK_STEM_PX + TICK_ARROW_PX + 2;
  const arrowBaseY = TICK_ARROW_PX;

  return (
    <svg
      className="pointer-events-none absolute top-0 left-1/2 overflow-visible"
      width={svgW}
      height={svgH}
      style={{ transform: "translateX(-50%)" }}
      viewBox={`${leftX - 4} 0 ${svgW} ${svgH}`}
      aria-hidden
    >
      <path
        d={`M ${leftX} ${badgeConnectY} V ${elbowY} H 0 V ${arrowBaseY}`}
        fill="none"
        stroke={percentileColor}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <path
        d={`M ${rightX} ${badgeConnectY} V ${elbowY} H 0 V ${arrowBaseY}`}
        fill="none"
        stroke={patientColor}
        strokeWidth={1.25}
        strokeLinejoin="round"
      />
      <polygon
        points={`0,0 ${-4},${arrowBaseY} ${4},${arrowBaseY}`}
        fill={patientColor}
      />
    </svg>
  );
}

function OverlapMarkerDown({
  marker,
  classification,
  labelBottom,
}: {
  marker: OverlapMarker;
  classification: BpClassification;
  labelBottom: number;
}) {
  const percentileColor = "#14b8a6";
  const patientColor = patientBadgeStyle(classification).arrowColor;
  const connectorHeight = labelBottom + TICK_STEM_PX + TICK_ARROW_PX;

  return (
    <div
      className="absolute bottom-0"
      style={{ left: `${marker.targetPct}%`, transform: "translateX(-50%)" }}
    >
      <div
        className="absolute flex items-end gap-7 whitespace-nowrap"
        style={{ bottom: labelBottom, left: "50%", transform: "translateX(-50%)" }}
      >
        <ClusterLabels cluster={marker.percentile} patientZone={classification} />
        <ClusterLabels cluster={marker.patient} patientZone={classification} forcePatient />
      </div>
      <OverlapElbowsDown
        percentileColor={percentileColor}
        patientColor={patientColor}
        connectorHeight={connectorHeight}
        labelBottom={labelBottom}
      />
    </div>
  );
}

function OverlapMarkerUp({
  marker,
  classification,
  labelTop,
}: {
  marker: OverlapMarker;
  classification: BpClassification;
  labelTop: number;
}) {
  const percentileColor = "#14b8a6";
  const patientColor = patientBadgeStyle(classification).arrowColor;
  const connectorHeight = labelTop + TICK_STEM_PX + TICK_ARROW_PX;

  return (
    <div
      className="absolute top-0"
      style={{ left: `${marker.targetPct}%`, transform: "translateX(-50%)" }}
    >
      <OverlapElbowsUp
        percentileColor={percentileColor}
        patientColor={patientColor}
        connectorHeight={connectorHeight}
        labelTop={labelTop}
      />
      <div
        className="absolute flex items-start gap-7 whitespace-nowrap"
        style={{ top: labelTop, left: "50%", transform: "translateX(-50%)" }}
      >
        <ClusterLabels cluster={marker.percentile} patientZone={classification} />
        <ClusterLabels cluster={marker.patient} patientZone={classification} forcePatient />
      </div>
    </div>
  );
}

function SingleMarkerDown({
  cluster,
  classification,
  labelBottom,
}: {
  cluster: TickCluster;
  classification: BpClassification;
  labelBottom: number;
}) {
  const arrowColor = patientArrowColor(cluster, classification);

  return (
    <div
      className="absolute bottom-0 flex flex-col items-center"
      style={clusterPositionStyle(cluster)}
    >
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: labelBottom }}>
        <ClusterLabels cluster={cluster} patientZone={classification} />
      </div>
      <div
        className="w-px shrink-0"
        style={{ height: TICK_STEM_PX, backgroundColor: arrowColor }}
        aria-hidden
      />
      <DownArrow color={arrowColor} />
    </div>
  );
}

function SingleMarkerUp({
  cluster,
  classification,
  labelTop,
}: {
  cluster: TickCluster;
  classification: BpClassification;
  labelTop: number;
}) {
  const arrowColor = patientArrowColor(cluster, classification);

  return (
    <div className="absolute top-0 flex flex-col items-center" style={clusterPositionStyle(cluster)}>
      <UpArrow color={arrowColor} />
      <div
        className="w-px shrink-0"
        style={{ height: TICK_STEM_PX, backgroundColor: arrowColor }}
        aria-hidden
      />
      <div className="absolute left-1/2 -translate-x-1/2" style={{ top: labelTop }}>
        <ClusterLabels cluster={cluster} patientZone={classification} />
      </div>
    </div>
  );
}

function DownArrow({ color }: { color: string }) {
  return (
    <div
      className="h-0 w-0 border-x-[4px] border-t-[5px] border-x-transparent"
      style={{ borderTopColor: color }}
      aria-hidden
    />
  );
}

function UpArrow({ color }: { color: string }) {
  return (
    <div
      className="h-0 w-0 border-x-[4px] border-b-[5px] border-x-transparent"
      style={{ borderBottomColor: color }}
      aria-hidden
    />
  );
}

/** SBP marker plane — labels above, arrow tips anchored to bottom edge (meets top of gradient). */
function MarkerPlaneDown({
  markers,
  classification,
  height,
}: {
  markers: PlaneMarker[];
  classification: BpClassification;
  height: number;
}) {
  const anchorOffset = TICK_STEM_PX + TICK_ARROW_PX;

  return (
    <div className="relative overflow-visible" style={{ height }}>
      {markers.map((marker) => {
        const stackRow = marker.type === "single" ? marker.cluster.stackRow : marker.stackRow;
        const labelBottom = anchorOffset + stackRow * TICK_STACK_ROW_PX;

        if (marker.type === "overlap") {
          return (
            <OverlapMarkerDown
              key={markerKey(marker)}
              marker={marker}
              classification={classification}
              labelBottom={labelBottom}
            />
          );
        }

        return (
          <SingleMarkerDown
            key={markerKey(marker)}
            cluster={marker.cluster}
            classification={classification}
            labelBottom={labelBottom}
          />
        );
      })}
    </div>
  );
}

/** DBP marker plane — arrow tips anchored to top edge (meets bottom of gradient), labels below. */
function MarkerPlaneUp({
  markers,
  classification,
  height,
}: {
  markers: PlaneMarker[];
  classification: BpClassification;
  height: number;
}) {
  const anchorOffset = TICK_STEM_PX + TICK_ARROW_PX;

  return (
    <div className="relative overflow-visible" style={{ height }}>
      {markers.map((marker) => {
        const stackRow = marker.type === "single" ? marker.cluster.stackRow : marker.stackRow;
        const labelTop = anchorOffset + stackRow * TICK_STACK_ROW_PX;

        if (marker.type === "overlap") {
          return (
            <OverlapMarkerUp
              key={markerKey(marker)}
              marker={marker}
              classification={classification}
              labelTop={labelTop}
            />
          );
        }

        return (
          <SingleMarkerUp
            key={markerKey(marker)}
            cluster={marker.cluster}
            classification={classification}
            labelTop={labelTop}
          />
        );
      })}
    </div>
  );
}

function classificationTierKey(c: BpClassification): BpThresholdRow["tierKey"] | null {
  switch (c) {
    case "normal":
      return "p50";
    case "elevated":
      return "p90";
    case "stage1":
      return "p95";
    case "stage2":
      return "p95plus12";
  }
}

export interface BpPercentileGradientChartProps {
  sbp: number;
  dbp: number;
  thresholds: BpThresholdRow[];
  sbpClassification: BpClassification;
  dbpClassification: BpClassification;
}

export default function BpPercentileGradientChart({
  sbp,
  dbp,
  thresholds,
  sbpClassification,
  dbpClassification,
}: BpPercentileGradientChartProps) {
  const { p50, p90, p95, p95plus12 } = getThresholds(thresholds);

  const sbpScale = buildScale(
    sbp,
    p50.sbpThreshold,
    p90.sbpThreshold,
    p95.sbpThreshold,
    p95plus12.sbpThreshold,
  );
  const dbpScale = buildScale(
    dbp,
    p50.dbpThreshold,
    p90.dbpThreshold,
    p95.dbpThreshold,
    p95plus12.dbpThreshold,
  );

  const sbpClusters = buildAxisClusters(sbpScale, sbp);
  const dbpClusters = buildAxisClusters(dbpScale, dbp);
  const sbpMarkers = resolvePlaneMarkers(sbpClusters, sbpClassification);
  const dbpMarkers = resolvePlaneMarkers(dbpClusters, dbpClassification);
  const markerHeight = Math.max(
    markerPlaneHeightFromMarkers(sbpMarkers),
    markerPlaneHeightFromMarkers(dbpMarkers),
  );
  const visualZones = sharedVisualZoneWidths();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-teal-700">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: ZONE_COLORS.green }} />
          50th to &lt;90th percentile
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: ZONE_COLORS.yellow }} />
          90th to &lt;95th percentile
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: ZONE_COLORS.lightRed }} />
          95th to &lt;95th + 12 mm Hg
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: ZONE_COLORS.deepRed }} />
          ≥ 95th + 12 mm Hg
        </span>
      </div>

      <div className="flex overflow-hidden rounded-xl border border-teal-200 bg-white shadow-sm">
        <div className="flex w-6 shrink-0 items-center justify-center border-r border-teal-100 bg-teal-50/40">
          <span
            className="text-[10px] font-semibold tracking-wide text-teal-600 [writing-mode:vertical-lr]"
            aria-hidden
          >
            mm Hg
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="px-3 pt-3 pb-3">
            <div
              className="origin-top"
              style={{
                transform: `scale(${GRAPHIC_SCALE})`,
                transformOrigin: "top center",
                paddingLeft: GRAPHIC_INSET_PX,
                paddingRight: GRAPHIC_INSET_PX,
              }}
            >
              <div className="mb-1 text-xs font-semibold text-teal-900">Systolic (SBP)</div>

              <MarkerPlaneDown
                markers={sbpMarkers}
                classification={sbpClassification}
                height={markerHeight}
              />

              <div className="h-11 overflow-hidden rounded-t-lg border border-b-0 border-teal-200 shadow-inner">
                <GradientStrip zones={visualZones} />
              </div>

              <div className="h-11 overflow-hidden rounded-b-lg border border-t-0 border-teal-200 shadow-inner">
                <GradientStrip zones={visualZones} />
              </div>

              <MarkerPlaneUp
                markers={dbpMarkers}
                classification={dbpClassification}
                height={markerHeight}
              />

              <div className="mt-1 text-xs font-semibold text-teal-900">Diastolic (DBP)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BpThresholdTable({
  thresholds,
  sbp,
  dbp,
  sbpClassification,
  dbpClassification,
}: BpPercentileGradientChartProps) {
  function cellClass(isActive: boolean): string {
    return isActive ? "font-bold text-teal-950" : "text-teal-800";
  }

  function tierApplies(
    tierKey: BpThresholdRow["tierKey"],
    classification: BpClassification,
    exceeded: boolean,
  ): boolean {
    const active = classificationTierKey(classification);
    if (classification === "normal") {
      return tierKey === "p50";
    }
    if (tierKey === active) return true;
    return exceeded && tierKey !== "p50";
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[24rem] text-left text-sm">
        <thead>
          <tr className="border-b border-teal-100 text-xs text-teal-600">
            <th className="py-2 pr-3 font-medium">BP percentile</th>
            <th className="py-2 pr-3 font-medium">SBP (mm Hg)</th>
            <th className="py-2 font-medium">DBP (mm Hg)</th>
          </tr>
        </thead>
        <tbody>
          {thresholds.map((tier) => {
            const sbpApplies = tierApplies(tier.tierKey, sbpClassification, tier.sbpExceeded);
            const dbpApplies = tierApplies(tier.tierKey, dbpClassification, tier.dbpExceeded);

            return (
              <tr key={tier.tierKey} className="border-b border-teal-50">
                <td
                  className={`py-2 pr-3 ${sbpApplies || dbpApplies ? "font-semibold text-teal-950" : "font-medium text-teal-900"}`}
                >
                  {tier.tierLabel}
                </td>
                <td className={`py-2 pr-3 ${cellClass(sbpApplies)}`}>{tier.sbpThreshold}</td>
                <td className={`py-2 ${cellClass(dbpApplies)}`}>{tier.dbpThreshold}</td>
              </tr>
            );
          })}
          <tr className="bg-teal-50/60">
            <td className="py-2 pr-3 font-semibold text-teal-900">Measured</td>
            <td className="py-2 pr-3 font-bold text-teal-950">{sbp}</td>
            <td className="py-2 font-bold text-teal-950">{dbp}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
