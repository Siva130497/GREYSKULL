/**
 * Auto-generated from: Essential SKUs 010126 List for Field Team v2 (1).xlsx
 * Sheet: Summary
 * Rows: 131
 *
 * Seeds:
 *  - EssentialItem (master)
 *  - ShellStockItem (per-shell stock status, default inStock=true)
 *
 * Usage:
 *   1) Put this file at: server/src/seeders/seedEssentialStockInline.js
 *   2) Ensure server/.env has MONGO_URI
 *   3) Run: node src/seeders/seedEssentialStockInline.js
 */
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

const EssentialItem = require("../models/EssentialItem.js");
const ShellStockItem = require("../models/ShellStockItem.js");
const Shell = require("../models/Shell.model.js");

const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!uri) {
  console.error("❌ Missing Mongo URI env. Set MONGO_URI (or MONGODB_URI / DATABASE_URL) in server/.env");
  process.exit(1);
}

const SHELLS_ALL = [
  "Harlow",
  "Enfield",
  "Buckhurst hill",
  "Broxbourne",
  "Half moon",
  "Sawbridgeworth",
  "Bullsmoor",
  "Epping",
];

function norm(s = "") {
  return String(s).trim().toLowerCase();
}

// Your rules
function shellsForFormat(fmtRaw) {
  const fmt = norm(fmtRaw);

  if (fmt === "all formats") return SHELLS_ALL;

  if (fmt === "co-op" || fmt === "select & co-op") return ["Bullsmoor"];

  if (fmt === "waitrose") return ["Broxbourne", "Half moon", "Sawbridgeworth"];

  if (fmt === "select") return ["Harlow", "Enfield", "Buckhurst hill", "Epping"];

  return [];
}

const SEED_ITEMS = [
  {"name":"BIRRA MORETTI 4PK CAN - 4.6% 4X440ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"BIRRA MORETTI 660ML NRB","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"BUDWEISER 660ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"CLASSIC COTES DU RHONE 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"CO OP IRRESISTIBLE PROSECCO 75CL","category":"Alcoholic Beverages","format":"Co-op"},
  {"name":"CO OP PINOT GRIGIO DELLE VENEZ 75CL","category":"Alcoholic Beverages","format":"Co-op"},
  {"name":"HEINEKEN 4X568ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"HEINEKEN 650ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"I HEART PINOT GRIGIO 75CL","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"I HEART PROSECCO 75CL","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"I HEART ROSE 75CL","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"I HEART SAUVIGNON BLANC 75CL","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"JACK DANIELS & COKE 330ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"OYSTER BAY SAUVIGNON BLANC 75CL","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"PERONI NAST AZZ 620ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"SAN LEO PROSECCO BRUT 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"STELLA A PINT 4.6% 568ML 4PK","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"STELLA ARTOIS 4.6% 660ML NRB","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"STRONGBOW ORIGINAL CIDER 4X440ML","category":"Alcoholic Beverages","format":"All formats"},
  {"name":"TIKI RIDGE SAUVIGNON BLANC RESERVE 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"VILLA MARIA SAUVIGNON BLANC 12.5% 75CL","category":"Alcoholic Beverages","format":"Select & Co-Op"},
  {"name":"WHALE CALLER SAUVIGNON/COLOMBARD 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"WR CRISP AND FLORAL ITALIAN WHITE 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"WR PINOT GRIGIO VENETO ITALY 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"WR PROSECCO 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"WR SPANISH ROSE 75CL","category":"Alcoholic Beverages","format":"Waitrose"},
  {"name":"WALLS SAUSAGE ROLL 130G","category":"Food","format":"Select"},
  {"name":"FRIDGE RAIDERS ROAST CHICKEN 45G","category":"Food","format":"All formats"},
  {"name":"DBS ALL DAY BREAKFAST TURNOVER X1","category":"Food Service","format":"All formats"},
  {"name":"DBS AMERICAN HOT SLICE X1","category":"Food Service","format":"All formats"},
  {"name":"DBS BACON & CHEESE TURNOVER X1","category":"Food Service","format":"All formats"},
  {"name":"DBS BUTTER CROISSANT X1","category":"Food Service","format":"All formats"},
  {"name":"DBS HAM & CHEESE TOASTIE X1","category":"Food Service","format":"All formats"},
  {"name":"DBS HOG ROAST ROLL x1","category":"Food Service","format":"All formats"},
  {"name":"DBS PAIN AU CHOCOLAT X1","category":"Food Service","format":"All formats"},
  {"name":"DBS PEPPERED STEAK SLICE X1","category":"Food Service","format":"All formats"},
  {"name":"DBS SAUSAGE BAP X1","category":"Food Service","format":"All formats"},
  {"name":"DBS SAUSAGE ROLL X1","category":"Food Service","format":"All formats"},
  {"name":"DBS SPICY PEPERONI & CHORIZO SLICE X1","category":"Food Service","format":"All formats"},
  {"name":"DBS TRIPLE CHOCOLATE DONUT X1","category":"Food Service","format":"All formats"},
  {"name":"DBS BACON & CHEESE BAP X1","category":"Food Service","format":"All formats"},
  {"name":"CO OP BRIT 6 FREE RANGE MED EGGS 6PK","category":"Groceries","format":"Co-op"},
  {"name":"HOVIS SOFT WHITE MED LOAF 800G","category":"Groceries","format":"Select & Co-Op"},
  {"name":"LES BRIOCHES PAINS AU CHOC 45G","category":"Groceries","format":"Select"},
  {"name":"NUROFEN TABLETS 12S","category":"Groceries","format":"All formats"},
  {"name":"PANADOL ADVANCE TABS 16PK","category":"Groceries","format":"All formats"},
  {"name":"WR CHOCOLATE MINI ROLLS 17S","category":"Groceries","format":"Waitrose"},
  {"name":"WR CROISSANTS 4S","category":"Groceries","format":"Waitrose"},
  {"name":"WR FR LARGE BLACKTAIL EGGS 6S","category":"Groceries","format":"Waitrose"},
  {"name":"WR MINI CORNFLAKE CLUSTER BITES 200G","category":"Groceries","format":"Waitrose"},
  {"name":"WR NO1 PAIN AUX RAISINS 2PK","category":"Groceries","format":"Waitrose"},
  {"name":"WR PAINS AU CHOCOLAT 4S","category":"Groceries","format":"Waitrose"},
  {"name":"WR SOFT WHITE MEDIUM SLICED BREAD 800G","category":"Groceries","format":"Waitrose"},
  {"name":"ADBLUE 10LTR","category":"Lubricants","format":"All formats"},
  {"name":"ADBLUE 5LTR PET","category":"Lubricants","format":"All formats"},
  {"name":"HELIX ULTRA ECT C3 5W30 1L","category":"Lubricants","format":"All formats"},
  {"name":"HELIX ULTRA PROFESSIONAL AF 5W30 1L","category":"Lubricants","format":"All formats"},
  {"name":"BUXTON MINERAL WATER 1 LITRE","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"BUXTON MINERAL WATER S/CAP 750ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"BUXTON STILL 1.5LTR","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"COCA COLA 330ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"COCA COLA ZERO 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"COCA-COLA COKE BOTTL 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"DIET COKE 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"DR PEPPER 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"EVIAN MINERAL WATER PET 50CL","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"EVIAN SPORTSCAP 750ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"FANTA ORANGE 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"LUCOZADE ENERGY ORANGE 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"LUCOZADE SPORT ORANGE 750MK","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"LUCOZADE SPORT RASP 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"MONSTER ENERGY 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"MONSTER MANGO LOCO 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"MONSTER ULTRA 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"OASIS SUMMER FRUITS 500ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"PEPSI MAX 500ML PET","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"RED BULL 250ML.","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"RED BULL 4X250ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"RED BULL SUGAR FREE 250ML","category":"Non Alcoholic Beverages","format":"All formats"},
  {"name":"NRG IPHONE 5/6 SYNC CABLE","category":"Non-Food","format":"All formats"},
  {"name":"RTU SCREENWASH ALL SEASONS 3L","category":"Non-Food","format":"All formats"},
  {"name":"SHELL ALL SEASONS SCREENWASH 5LTR","category":"Non-Food","format":"All formats"},
  {"name":"SHELL FUEL CAN 5LTR","category":"Non-Food","format":"All formats"},
  {"name":"CO OP 2PT FRSH SEM SKIMM MILK 1.136LTR","category":"Perishables","format":"Co-op"},
  {"name":"CO OP 2PT WHOLE FRESH MILK 1.136LTR","category":"Perishables","format":"Co-op"},
  {"name":"CO OP 4PT SEMI SKIMMED MILK 2.272LTR","category":"Perishables","format":"Co-op"},
  {"name":"CO OP 4PT WHOLE FRESH MILK 2.272LTR","category":"Perishables","format":"Co-op"},
  {"name":"CO OP STONEBAKED MARGHERITA PIZZA 320G","category":"Perishables","format":"Co-op"},
  {"name":"CO OP STONEBAKED PEPPERONI PIZZA 327G","category":"Perishables","format":"Co-op"},
  {"name":"FRESHWAYS SEMI SKIMMED MILK 1LTR","category":"Perishables","format":"Select"},
  {"name":"FRESHWAYS SEMI SKIMMED MILK 2LTR","category":"Perishables","format":"Select"},
  {"name":"FRESHWAYS WHOLE MILK  1LTR","category":"Perishables","format":"Select"},
  {"name":"FRESHWAYS WHOLE MILK 2LTR","category":"Perishables","format":"Select"},
  {"name":"HUEL CHOCOLATE READY TO DRINK 500ML","category":"Perishables","format":"All formats"},
  {"name":"STARBUCKS DOUBLESHOT 200ML","category":"Perishables","format":"All formats"},
  {"name":"STARBUCKS TRIPLESHOT 330ML","category":"Perishables","format":"All formats"},
  {"name":"TROPICANA SMOOTH ORANGE 300ML","category":"Perishables","format":"All formats"},
  {"name":"WR BACK BACON DRY CURE UNSMOKED 8S","category":"Perishables","format":"Waitrose"},
  {"name":"WR ESS SEMI SKIMMED MILK 1L","category":"Perishables","format":"Waitrose"},
  {"name":"WR ESS SEMI SKIMMED MILK 4PT","category":"Perishables","format":"Waitrose"},
  {"name":"WR ESS WHOLE MILK 1.14 LTR","category":"Perishables","format":"Waitrose"},
  {"name":"WR ESS WHOLE MILK 2.27 LTR","category":"Perishables","format":"Waitrose"},
  {"name":"WR MARGHERITA PIZZA 356G","category":"Perishables","format":"Waitrose"},
  {"name":"WR NO1 SPICY CALABRIAN SALAMI PIZZA 490G","category":"Perishables","format":"Waitrose"},
  {"name":"WR PEPPERONI PIZZA 385G","category":"Perishables","format":"Waitrose"},
  {"name":"EXTRA PEPPERMINT SF 10PK 14G","category":"Snacks","format":"All formats"},
  {"name":"EXTRA PEPPERMINT SF BTL 46PK","category":"Snacks","format":"All formats"},
  {"name":"GRENADE OREO 60G","category":"Snacks","format":"All formats"},
  {"name":"GRENADE SALTED CARAMEL 60G","category":"Snacks","format":"All formats"},
  {"name":"HARIBO TANGFASTICS 160G","category":"Snacks","format":"All formats"},
  {"name":"HULA HOOPS BIG BEEF 45G","category":"Snacks","format":"All formats"},
  {"name":"MARLYAND CCHIP COOKIES 200g","category":"Snacks","format":"All formats"},
  {"name":"MARS DUO 79G","category":"Snacks","format":"All formats"},
  {"name":"MCCOYS FLAME GRILLED STEAK 45G","category":"Snacks","format":"All formats"},
  {"name":"MCCOYS SALT & MALT VINEGAR 45G","category":"Snacks","format":"All formats"},
  {"name":"SNICKERS 48G","category":"Snacks","format":"All formats"},
  {"name":"TWIX XTRA 75G","category":"Snacks","format":"All formats"},
  {"name":"WALKERS CHEESE & ONION 45G","category":"Snacks","format":"All formats"},
  {"name":"WALKERS READY SALTED 45G","category":"Snacks","format":"All formats"},
  {"name":"EU AMBER LEAF 30G","category":"Tobacco","format":"All formats"},
  {"name":"EU B&H BLUE KS 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU B&H BLUE SK 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU B&H GOLD KS 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU B&H SILVER KS 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU GV ORIGINAL 30G","category":"Tobacco","format":"All formats"},
  {"name":"EU L&B BLUE R/BLUEKS 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU L&B SILVER KS 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU MARLBORO GOLD KS 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU MARLBORO TOUCH 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU MAYFAIR KS ORIGINAL BLUE 20S","category":"Tobacco","format":"All formats"},
  {"name":"EU STERLING DUAL KS NEW 20","category":"Tobacco","format":"All formats"},
];


async function run() {
  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Load shells from DB
    const shellsDb = await Shell.find({ name: { $in: SHELLS_ALL } }).lean();
    const shellIdByName = new Map(shellsDb.map((s) => [norm(s.name), s._id]));

    // Warn if any shell missing
    for (const name of SHELLS_ALL) {
      if (!shellIdByName.has(norm(name))) {
        console.warn(`⚠️ Shell not found in DB: "${name}" (will be skipped)`);
      }
    }

    let itemsUpserted = 0;
    let linksUpserted = 0;

    for (const row of SEED_ITEMS) {
      const name = String(row.name || "").trim();
      const category = String(row.category || "").trim();
      const format = String(row.format || "").trim();
      if (!name || !category || !format) continue;

      // Upsert master item
      const item = await EssentialItem.findOneAndUpdate(
        { name },
        { $set: { name, category } },
        { upsert: true, new: true }
      );
      itemsUpserted++;

      const shellNames = shellsForFormat(format);
      for (const shellName of shellNames) {
        const shellId = shellIdByName.get(norm(shellName));
        if (!shellId) continue;

        await ShellStockItem.findOneAndUpdate(
          { shellId, itemId: item._id },
          { $setOnInsert: { inStock: true } },
          { upsert: true, new: true }
        );
        linksUpserted++;
      }
    }

    console.log("✅ Seed done");
    console.log("Items upserted:", itemsUpserted);
    console.log("Shell links upserted:", linksUpserted);

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

run();
