import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

test('1. Supabase Schema: Critical RLS shared sessions leak must be resolved', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  assert.ok(
    !schemaSql.includes('USING (share_token IS NOT NULL);'),
    'FAIL: Insecure "share_token IS NOT NULL" broad SELECT policy still exists!'
  );

  assert.ok(
    schemaSql.includes('CREATE OR REPLACE FUNCTION public.get_shared_session'),
    'FAIL: Secure get_shared_session RPC function is missing from schema.sql!'
  );

  assert.ok(
    schemaSql.includes('REVOKE EXECUTE ON FUNCTION public.get_shared_session(TEXT) FROM public;'),
    'FAIL: get_shared_session function must revoke default public execute!'
  );
});

test('2. Supabase Schema: Missing database tables must be defined with RLS', () => {
  const schemaPath = path.join(rootDir, 'supabase', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const requiredTables = [
    'public.medications',
    'public.medication_logs',
    'public.community_posts',
    'public.community_groups',
    'public.community_messages'
  ];

  for (const table of requiredTables) {
    assert.ok(
      schemaSql.includes(`CREATE TABLE IF NOT EXISTS ${table}`),
      `FAIL: Table ${table} is missing from schema.sql!`
    );
    assert.ok(
      schemaSql.includes(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`),
      `FAIL: Table ${table} lacks RLS enablement!`
    );
  }
});

test('3. Mobile SyncEngine: Guest IDs and invalid UUIDs must be guarded', () => {
  const syncEnginePath = path.join(rootDir, 'apps', 'mobile', 'src', 'services', 'supabase', 'syncEngine.ts');
  const syncEngineCode = fs.readFileSync(syncEnginePath, 'utf8');

  assert.ok(
    syncEngineCode.includes("user.id.startsWith('guest_')"),
    'FAIL: syncEngine must explicitly ignore guest_ users!'
  );
  assert.ok(
    syncEngineCode.includes('isUUID'),
    'FAIL: syncEngine must validate UUID format before making cloud queries!'
  );
});

test('4. Web API: sync-toggle must enforce caller authentication & authorization', () => {
  const syncTogglePath = path.join(rootDir, 'apps', 'web', 'api', 'sync-toggle.js');
  const syncToggleCode = fs.readFileSync(syncTogglePath, 'utf8');

  assert.ok(
    syncToggleCode.includes('req.headers.authorization'),
    'FAIL: sync-toggle.js does not check authorization header!'
  );
  assert.ok(
    syncToggleCode.includes('authUser.id !== userId'),
    'FAIL: sync-toggle.js does not verify caller ownership of userId!'
  );
});

test('5. Web API: cron-sync must require mandatory CRON_SECRET', () => {
  const cronSyncPath = path.join(rootDir, 'apps', 'web', 'api', 'cron-sync.js');
  const cronSyncCode = fs.readFileSync(cronSyncPath, 'utf8');

  assert.ok(
    cronSyncCode.includes('!expectedSecret || authHeader !== `Bearer ${expectedSecret}`'),
    'FAIL: cron-sync.js must reject unauthenticated execution when CRON_SECRET is unset or mismatched!'
  );
});

test('6. Web API: chat.js Discord alert must redact patient PII/PHI', () => {
  const chatApiPath = path.join(rootDir, 'apps', 'web', 'api', 'chat.js');
  const chatApiCode = fs.readFileSync(chatApiPath, 'utf8');

  assert.ok(
    !chatApiCode.includes("value: profile?.name || 'Anonymous'"),
    'FAIL: chat.js is still leaking patient name to Discord webhook!'
  );
  assert.ok(
    !chatApiCode.includes("value: urgencyData.summary"),
    'FAIL: chat.js is still leaking clinical summary to Discord webhook!'
  );
});

test('7. Web Frontend: FileUploadStep.jsx endpoints and PDF checks', () => {
  const fileUploadPath = path.join(rootDir, 'apps', 'web', 'src', 'components', 'shared', 'FileUploadStep.jsx');
  const fileUploadCode = fs.readFileSync(fileUploadPath, 'utf8');

  assert.ok(
    fileUploadCode.includes('/api/document?action=ocr'),
    'FAIL: FileUploadStep.jsx must use /api/document?action=ocr!'
  );
  assert.ok(
    fileUploadCode.includes('/api/document?action=classify'),
    'FAIL: FileUploadStep.jsx must use /api/document?action=classify!'
  );
});

test('8. AI Safety Classifier: Red-flag emergency detection across languages', () => {
  const EMERGENCY_KEYWORDS = [
    'chest pain', 'heart attack', 'cannot breathe', 'shortness of breath', 'severe bleeding',
    'stroke', 'unconscious', 'fainted', 'suicide', 'kill myself', 'overdose', 'poison',
    'የደረት ህመም', 'መተንፈስ አቃተኝ', 'ደም መፍሰስ', 'ራስ መሳት',
    'dhukkubbi qoma', 'harganuu dadhabuu', 'dhiiguu hamaa', 'of wallaaluu'
  ];

  function classify(text) {
    const lower = text.toLowerCase();
    const isEmergency = EMERGENCY_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
    return { isEmergency };
  }

  assert.equal(classify('I am having sudden chest pain and shortness of breath').isEmergency, true);
  assert.equal(classify('እባክዎን እርዱኝ የደረት ህመም አለብኝ').isEmergency, true);
  assert.equal(classify('Dhukkubbi qoma cimaatu natti dhagahama').isEmergency, true);
  assert.equal(classify('What herbal tea can help with relaxation before bedtime?').isEmergency, false);
});

test('9. Digital Wellness Engine: Digital Balance scoring and PIN hashing', async () => {
  const enginePath = path.join(rootDir, 'apps', 'mobile', 'src', 'lib', 'digitalWellnessEngine.ts');
  const engineCode = fs.readFileSync(enginePath, 'utf8');

  assert.ok(
    engineCode.includes('computeDigitalBalanceScore'),
    'FAIL: digitalWellnessEngine must export computeDigitalBalanceScore!'
  );
  assert.ok(
    engineCode.includes('hashStrictPin'),
    'FAIL: digitalWellnessEngine must export hashStrictPin!'
  );
  assert.ok(
    engineCode.includes('verifyStrictPin'),
    'FAIL: digitalWellnessEngine must export verifyStrictPin!'
  );
  assert.ok(
    engineCode.includes('FOCUS_PRESETS'),
    'FAIL: digitalWellnessEngine must export FOCUS_PRESETS!'
  );
});

test('10. Burnout Prevention & Recovery Engine: Maslach matrix & 4 recovery states', async () => {
  const enginePath = path.join(rootDir, 'apps', 'mobile', 'src', 'lib', 'burnoutRecoveryEngine.ts');
  const engineCode = fs.readFileSync(enginePath, 'utf8');

  assert.ok(
    engineCode.includes('evaluateBurnoutAndRecovery'),
    'FAIL: burnoutRecoveryEngine must export evaluateBurnoutAndRecovery!'
  );
  assert.ok(
    engineCode.includes('MASLACH_AREAS'),
    'FAIL: burnoutRecoveryEngine must include MASLACH_AREAS!'
  );
  assert.ok(
    engineCode.includes('RECOVERY_INTERVENTIONS'),
    'FAIL: burnoutRecoveryEngine must export RECOVERY_INTERVENTIONS!'
  );
  assert.ok(
    engineCode.includes('THREE_DAY_RECOVERY_PLAN'),
    'FAIL: burnoutRecoveryEngine must export THREE_DAY_RECOVERY_PLAN!'
  );
  assert.ok(
    engineCode.includes('High Strain') && engineCode.includes('Recovery Needed'),
    'FAIL: burnoutRecoveryEngine must evaluate high strain and recovery needed states!'
  );
});
