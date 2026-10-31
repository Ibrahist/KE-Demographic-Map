import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IndicatorDefinition, INDICATORS, INDICATOR_CATEGORIES } from '@/types/indicators';

/**
 * Bulk CSV Export for current view features.
 */
export function exportDataAsCsv(
  features: any[],
  indicator: IndicatorDefinition,
  activeLevel: string,
  filename?: string
) {
  if (!features || features.length === 0) return;

  const headers = [
    'Unit Code',
    'Name',
    'Level',
    'Parent County',
    'Parent Sub-County',
    'Population',
    'Area (km²)',
    'Density (people/km²)',
    `${indicator.name} (${indicator.unit})`,
  ];

  const rows = features.map((f: any) => {
    const p = f.properties || {};
    const val = p[indicator.id] != null ? p[indicator.id] : '';
    return [
      `"${p.code || ''}"`,
      `"${p.name || ''}"`,
      `"${p.level || activeLevel}"`,
      `"${p.county_name || ''}"`,
      `"${p.subcounty_name || ''}"`,
      p.pop_total != null ? p.pop_total : '',
      p.area_sqkm != null ? p.area_sqkm : '',
      p.pop_density != null ? p.pop_density : '',
      `"${val}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadBlob(csvContent, filename || `kenya_${activeLevel}_${indicator.id}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Captures map viewport as PNG.
 */
export async function exportMapAsPng(elementId: string, filename: string = 'kenya_demographic_map.png') {
  const node = document.getElementById(elementId);
  if (!node) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  try {
    const dataUrl = await toPng(node, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#0f172a',
    });
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Error capturing map screenshot:', err);
    alert('Failed to generate PNG export. Ensure all tiles have loaded.');
  }
}

/**
 * Export Individual Area as CSV.
 */
export function exportSingleAreaCsv(feature: any) {
  if (!feature) return;
  const p = feature.properties || {};
  const name = p.name || 'unit';
  const level = p.level || 'Area';

  const rows: string[][] = [
    ['--- ADMINISTRATIVE PROFILE ---', '', '', ''],
    ['Area Name', p.name || '', '', ''],
    ['Administrative Level', level, '', ''],
    ['Unit Code / PCODE', p.code || p.pcode || '', '', ''],
    ['Parent County', p.county_name || 'N/A', '', ''],
    ['Parent Sub-County', p.subcounty_name || 'N/A', '', ''],
    ['Total Land Area (km²)', p.area_sqkm != null ? String(p.area_sqkm) : 'N/A', 'km²', 'Equal-Area Albers'],
    ['Total Population (2019)', p.pop_total != null ? String(p.pop_total) : 'N/A', 'people', 'KNBS 2019 Census'],
    ['Population Density', p.pop_density != null ? String(p.pop_density) : 'N/A', 'people/km²', 'Derived / KNBS'],
    ['', '', '', ''],
    ['--- DEMOGRAPHIC & SOCIO-ECONOMIC INDICATORS ---', '', '', ''],
    ['Indicator Name', 'Value', 'Unit', 'Source & Year'],
  ];

  // List all matching indicators
  INDICATORS.forEach((ind) => {
    const rawVal = p[ind.id];
    if (rawVal != null) {
      rows.push([
        ind.name,
        ind.formatValue(rawVal),
        ind.unit,
        `${ind.source} (${ind.year})`,
      ]);
    }
  });

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const safeFilename = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${level.toLowerCase()}_profile.csv`;
  downloadBlob(csvContent, safeFilename, 'text/csv;charset=utf-8;');
}

/**
 * Export Individual Area as GeoJSON.
 */
export function exportSingleAreaGeoJson(feature: any) {
  if (!feature) return;
  const p = feature.properties || {};
  const name = p.name || 'unit';
  const level = p.level || 'Area';

  const geoJsonData = {
    type: 'FeatureCollection',
    metadata: {
      generatedAt: new Date().toISOString(),
      country: 'Kenya',
      unitName: name,
      level: level,
      source: 'Kenya Demographic Map Pipeline (KNBS / OCHA COD-AB / IEBC / KDHS)',
    },
    features: [
      {
        type: 'Feature',
        id: p.code || p.id || undefined,
        properties: { ...p },
        geometry: feature.geometry,
      },
    ],
  };

  const jsonString = JSON.stringify(geoJsonData, null, 2);
  const safeFilename = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${level.toLowerCase()}.geojson`;
  downloadBlob(jsonString, safeFilename, 'application/geo+json;charset=utf-8;');
}

/**
 * Export Individual Area as PDF Factsheet.
 */
export function exportSingleAreaPdf(feature: any) {
  if (!feature) return;
  const p = feature.properties || {};
  const name = p.name || 'Unit';
  const level = p.level || 'Administrative Area';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Banner (Kenya Colors Accent)
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setFillColor(0, 102, 0); // Kenya Green bar
  doc.rect(0, 32, 70, 3, 'F');
  doc.setFillColor(153, 0, 0); // Kenya Red bar
  doc.rect(70, 32, 70, 3, 'F');
  doc.setFillColor(17, 17, 17); // Kenya Black bar
  doc.rect(140, 32, 70, 3, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(name.toUpperCase(), 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  const subTitle = [
    `Level: ${level}`,
    p.county_name && level !== 'County' ? `County: ${p.county_name}` : '',
    p.subcounty_name && level !== 'Sub-County' ? `Sub-County: ${p.subcounty_name}` : '',
    p.code ? `Code: ${p.code}` : '',
  ]
    .filter(Boolean)
    .join('  |  ');
  doc.text(subTitle, 14, 24);

  // Summary KPI Cards (Top Grid)
  const startY = 44;
  const kpis = [
    { label: 'TOTAL POPULATION', val: p.pop_total != null ? p.pop_total.toLocaleString() : 'N/A' },
    { label: 'LAND AREA', val: p.area_sqkm != null ? `${p.area_sqkm.toLocaleString()} km²` : 'N/A' },
    { label: 'POPULATION DENSITY', val: p.pop_density != null ? `${p.pop_density.toLocaleString()} /km²` : 'N/A' },
    { label: 'HOUSEHOLDS', val: p.households != null ? p.households.toLocaleString() : 'N/A' },
  ];

  const cardW = 43;
  const cardH = 18;
  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (cardW + 4);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, cardW, cardH, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + 3, startY + 6);

    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(kpi.val, x + 3, startY + 13);
  });

  // Table of Indicators Grouped by Category
  const tableRows: any[] = [];

  INDICATOR_CATEGORIES.forEach((cat) => {
    const catIndicators = INDICATORS.filter(
      (ind) => ind.category === cat.id && p[ind.id] != null
    );

    if (catIndicators.length > 0) {
      // Category section header row
      tableRows.push([
        { content: cat.label.toUpperCase(), colSpan: 4, styles: { fillColor: [241, 245, 249], fontStyle: 'bold', textColor: [15, 23, 42] } },
      ]);

      catIndicators.forEach((ind) => {
        const rawVal = p[ind.id];
        tableRows.push([
          ind.name,
          ind.formatValue(rawVal),
          ind.unit,
          `${ind.source} (${ind.year})`,
        ]);
      });
    }
  });

  autoTable(doc, {
    startY: startY + cardH + 8,
    head: [['Indicator', 'Value', 'Unit', 'Source & Year']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 30 },
      3: { cellWidth: 47 },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer Citation
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by Kenya Demographic Atlas on ${new Date().toLocaleDateString('en-GB')}  |  Sources: KNBS 2019 Census, KDHS 2022, KMHFL, OSM`,
    14,
    pageHeight - 8
  );

  const safeFilename = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${level.toLowerCase()}_factsheet.pdf`;
  doc.save(safeFilename);
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
