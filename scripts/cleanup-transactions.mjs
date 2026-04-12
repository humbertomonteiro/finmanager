/**
 * Script para reverter fiados pagos em uma data para "não pago".
 *
 * Como rodar:
 *   node --env-file=.env scripts/cleanup-transactions.mjs
 *
 * Por padrão reverte fiados pagos no dia 12/04/2026.
 * Para outra data passe como argumento:
 *   node --env-file=.env scripts/cleanup-transactions.mjs 2026-04-15
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, deleteField, doc } from "firebase/firestore";

// ── Configuração ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.VITE_FIREBASE_API_KEY,
  authDomain:        process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.VITE_FIREBASE_APP_ID,
};

// ── Data alvo ─────────────────────────────────────────────────────────────
const targetDate = process.argv[2] ?? "2026-04-12";

if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
  console.error(`❌  Formato de data inválido: "${targetDate}". Use YYYY-MM-DD`);
  process.exit(1);
}

console.log(`\n🔍  Buscando fiados pagos no dia ${targetDate}...\n`);

// ── Conexão ───────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Busca ─────────────────────────────────────────────────────────────────
const snapshot = await getDocs(collection(db, "transactions"));

const toRevert = snapshot.docs.filter((docSnap) => {
  const data = docSnap.data();
  const isFiado = data.type === "credit_sale" || data.type === "credit_service";
  const paidAtStr = typeof data.paidAt === "string" ? data.paidAt : "";
  return isFiado && paidAtStr.startsWith(targetDate);
});

if (toRevert.length === 0) {
  console.log(`✅  Nenhum fiado com pagamento em ${targetDate} encontrado.`);
  process.exit(0);
}

console.log(`⚠️   ${toRevert.length} fiado(s) serão revertidos para NÃO PAGO:\n`);
toRevert.forEach((docSnap, i) => {
  const d = docSnap.data();
  const valor  = typeof d.value === "number" ? `R$ ${d.value.toFixed(2)}` : "?";
  const client = d.customerName || d.description || "—";
  const criado = d.date   ? new Date(d.date).toLocaleDateString("pt-BR")   : "?";
  const pagto  = d.paidAt ? new Date(d.paidAt).toLocaleString("pt-BR")     : "?";
  console.log(`  ${i + 1}. ${client.padEnd(20)} ${valor.padStart(12)}  criado: ${criado}  pago em: ${pagto}`);
});

console.log("\nDigite 'sim' para confirmar ou qualquer outra coisa para cancelar:");

const { createInterface } = await import("readline");
const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("> ", async (answer) => {
  rl.close();
  if (answer.trim().toLowerCase() !== "sim") {
    console.log("\n❌  Operação cancelada.");
    process.exit(0);
  }

  console.log("\n↩️   Revertendo...");
  let ok = 0;
  let fail = 0;

  for (const docSnap of toRevert) {
    try {
      await updateDoc(doc(db, "transactions", docSnap.id), {
        isPaid:    false,
        paidAt:    deleteField(),
        updatedAt: new Date().toISOString(),
      });
      ok++;
      const name = docSnap.data().customerName || docSnap.id;
      process.stdout.write(`  ✓ ${name}\n`);
    } catch (err) {
      fail++;
      process.stdout.write(`  ✗ ${docSnap.id} — ${err.message}\n`);
    }
  }

  console.log(`\n✅  Concluído: ${ok} revertido(s)${fail > 0 ? `, ${fail} com erro` : ""}.\n`);
  process.exit(fail > 0 ? 1 : 0);
});
