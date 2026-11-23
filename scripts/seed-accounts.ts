import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

// Simple env loader
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://xgmkcriseqzlwajpxkfj.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Seeding Admin and Operator accounts into Supabase...");

  // 1. Akun Admin
  const adminEmail = "admin@suar.id";
  const adminPassword = "Password123!";
  const adminFullName = "Admin Platform SUAR";

  console.log(`Checking / Creating Admin: ${adminEmail}...`);
  const { data: adminList } = await supabaseAdmin.auth.admin.listUsers();
  const existingAdmin = adminList?.users.find((u) => u.email === adminEmail);

  let adminUser = existingAdmin;
  if (!existingAdmin) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        role: "admin",
        full_name: adminFullName,
      },
    });
    if (error) throw error;
    adminUser = created.user;
    console.log("Admin user created:", adminUser.id);
  } else {
    console.log("Admin user already exists. Updating password & role metadata...");
    const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(
      existingAdmin.id,
      {
        password: adminPassword,
        email_confirm: true,
        user_metadata: {
          role: "admin",
          full_name: adminFullName,
        },
      }
    );
    if (error) throw error;
    adminUser = updated.user;
  }

  // Ensure admin profile exists
  if (adminUser) {
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: adminUser.id,
        full_name: adminFullName,
      }, { onConflict: "id" });
  }

  // 2. Akun Operator
  const operatorEmail = "operator@suar.id";
  const operatorPassword = "Password123!";
  const operatorFullName = "Nakhoda Samudra Jaya";
  const companyName = "CV Samudra Jaya";

  console.log(`Checking / Creating Operator: ${operatorEmail}...`);
  const existingOp = adminList?.users.find((u) => u.email === operatorEmail);

  let operatorUser = existingOp;
  if (!existingOp) {
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: operatorEmail,
      password: operatorPassword,
      email_confirm: true,
      user_metadata: {
        role: "operator",
        full_name: operatorFullName,
        company_name: companyName,
      },
    });
    if (error) throw error;
    operatorUser = created.user;
    console.log("Operator user created:", operatorUser.id);
  } else {
    console.log("Operator user already exists. Updating password & role metadata...");
    const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(
      existingOp.id,
      {
        password: operatorPassword,
        email_confirm: true,
        user_metadata: {
          role: "operator",
          full_name: operatorFullName,
          company_name: companyName,
        },
      }
    );
    if (error) throw error;
    operatorUser = updated.user;
  }

  // Ensure operator profile exists
  if (operatorUser) {
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: operatorUser.id,
        full_name: operatorFullName,
      }, { onConflict: "id" });

    // Link or update in public.operators
    const { data: opData } = await supabaseAdmin
      .from("operators")
      .select("id, company_name")
      .eq("company_name", companyName)
      .maybeSingle();

    if (opData) {
      console.log(`Linking existing operator record (${companyName}) to user_id: ${operatorUser.id}`);
      await supabaseAdmin
        .from("operators")
        .update({
          user_id: operatorUser.id,
          email: operatorEmail,
          verified: true,
          phone: "081234567890",
          address: "Dermaga Pandanarang, Teluk Penyu, Cilacap",
        })
        .eq("id", opData.id);
    } else {
      console.log(`Creating operator record for ${companyName}`);
      await supabaseAdmin
        .from("operators")
        .insert({
          user_id: operatorUser.id,
          company_name: companyName,
          email: operatorEmail,
          phone: "081234567890",
          address: "Dermaga Pandanarang, Teluk Penyu, Cilacap",
          verified: true,
          ksop_certificate: "KSOP-CLP-2026-OP01",
        });
    }
  }

  // 3. Verifikasi Login Kedua Akun
  console.log("\nVerifikasi Login Menggunakan Supabase Auth...");

  const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";
  const publicClient = createClient(SUPABASE_URL, anonKey);

  const { data: adminLogin, error: adminLoginErr } = await publicClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });

  if (adminLoginErr) {
    console.error("Login Admin GAGAL:", adminLoginErr.message);
  } else {
    console.log("✓ Login Admin BERHASIL! User ID:", adminLogin.user.id, "| Role:", adminLogin.user.user_metadata?.role);
  }

  const { data: opLogin, error: opLoginErr } = await publicClient.auth.signInWithPassword({
    email: operatorEmail,
    password: operatorPassword,
  });

  if (opLoginErr) {
    console.error("Login Operator GAGAL:", opLoginErr.message);
  } else {
    console.log("✓ Login Operator BERHASIL! User ID:", opLogin.user.id, "| Role:", opLogin.user.user_metadata?.role);
  }

  console.log("\nSeed Akun Selesai!");
}

main().catch(console.error);
