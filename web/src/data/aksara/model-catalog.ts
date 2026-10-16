import baliLabels from '../../../../ai/deployment/models/bali/labels.json';
import baliManifest from '../../../../ai/deployment/models/bali/manifest.json';
import lontaraLabels from '../../../../ai/deployment/models/lontara/labels.json';
import lontaraManifest from '../../../../ai/deployment/models/lontara/manifest.json';
import sundaLabels from '../../../../ai/deployment/models/sunda/labels.json';
import sundaManifest from '../../../../ai/deployment/models/sunda/manifest.json';
import classifierConfig from '../../../../shared/aksara-classifier.json';

import { KATALOG_DATA, MODEL_GLIF_DATA, type GlifData } from './trinitas';

type AksaraId = 'lontara' | 'sunda' | 'bali';

const MODEL_LABELS = { lontara: lontaraLabels, sunda: sundaLabels, bali: baliLabels };
const MODEL_MANIFESTS = { lontara: lontaraManifest, sunda: sundaManifest, bali: baliManifest };

function indexGlyphs(aksaraId: AksaraId): Map<string, GlifData> {
  const glyphs = new Map<string, GlifData>();
  for (const glif of [...KATALOG_DATA[aksaraId].glifList, ...MODEL_GLIF_DATA[aksaraId]]) {
    if (glyphs.has(glif.slug)) throw new Error(`Duplicate glyph slug: ${aksaraId}/${glif.slug}`);
    glyphs.set(glif.slug, glif);
  }
  return glyphs;
}

function indexTargets(aksaraId: AksaraId): Map<string, string> {
  const { targets, displayNames } = classifierConfig.scripts[aksaraId];
  const sourceLabels = new Set(MODEL_LABELS[aksaraId].map((label) => label.source_label));
  const slugs = new Map<string, string>();
  for (const [slug, sourceLabel] of Object.entries(targets)) {
    if (!sourceLabels.has(sourceLabel) || slugs.has(sourceLabel) || !(sourceLabel in displayNames)) {
      throw new Error(`Invalid classifier mapping: ${aksaraId}/${slug} → ${sourceLabel}`);
    }
    slugs.set(sourceLabel, slug);
  }
  return slugs;
}

function buildCatalog(aksaraId: AksaraId): readonly GlifData[] {
  const labels = MODEL_LABELS[aksaraId];
  const glyphs = indexGlyphs(aksaraId);
  const slugs = indexTargets(aksaraId);
  if (labels.length !== MODEL_MANIFESTS[aksaraId].num_classes || slugs.size !== labels.length) {
    throw new Error(`Incomplete model catalogue: ${aksaraId}`);
  }
  return labels.map((label, index) => {
    const slug = slugs.get(label.source_label);
    const glif = slug === undefined ? undefined : glyphs.get(slug);
    if (label.class_id !== index || !glif) {
      throw new Error(`Missing model glyph: ${aksaraId}/${label.class_id} (${label.source_label})`);
    }
    return glif;
  });
}

const MODEL_CATALOGS: Record<AksaraId, readonly GlifData[]> = {
  lontara: buildCatalog('lontara'),
  sunda: buildCatalog('sunda'),
  bali: buildCatalog('bali'),
};

export function getModelTrainingCatalog(aksaraId: AksaraId): readonly GlifData[] {
  return MODEL_CATALOGS[aksaraId];
}
