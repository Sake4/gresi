// =============================================================================
// Test de charge de valider_scan (k6) — S6
// Objectif (cahier des charges §4.1) : ≥ 50 scans/s pendant 5 min, sans erreur,
// réponse < 2 s.
//
// À lancer UNIQUEMENT sur gresi-dev (jamais sur la production) :
//   k6 run -e SUPABASE_URL=… -e SUPABASE_CLE=… -e JWT_DISTRIBUTEUR=… \
//          -e ACTIVITE_ID=… -e QR_TOKENS=uuid1,uuid2,… scripts/test-charge/valider-scan.js
//
// JWT_DISTRIBUTEUR : access_token d'un compte distributeur affecté à ACTIVITE_ID
// QR_TOKENS        : jetons de participants inscrits à cette activité
// =============================================================================
import http from 'k6/http';
import { check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  scenarios: {
    scans: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 60,
      maxVUs: 200,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.001'],
    http_req_duration: ['p(95)<2000'],
  },
};

const jetons = __ENV.QR_TOKENS.split(',');

export default function () {
  const jeton = jetons[Math.floor(Math.random() * jetons.length)];
  const reponse = http.post(
    `${__ENV.SUPABASE_URL}/rest/v1/rpc/valider_scan`,
    JSON.stringify({ p_qr_token: jeton, p_activite_id: __ENV.ACTIVITE_ID, p_scan_id_client: uuidv4() }),
    {
      headers: {
        apikey: __ENV.SUPABASE_CLE,
        Authorization: `Bearer ${__ENV.JWT_DISTRIBUTEUR}`,
        'Content-Type': 'application/json',
      },
    },
  );
  check(reponse, {
    'HTTP 200': (r) => r.status === 200,
    'résultat attendu': (r) => ['valide', 'deja_utilise'].includes(r.json('resultat')),
  });
}
