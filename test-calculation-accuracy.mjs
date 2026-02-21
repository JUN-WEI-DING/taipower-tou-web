/**
 * Test calculation accuracy against Python reference implementation
 */

import { readFileSync } from 'fs';
const plans = JSON.parse(readFileSync('./frontend/public/data/plans.json', 'utf-8'));

// Test cases matching Python taipower-tou behavior
const testCases = [
  {
    name: 'Residential Non-TOU - 500 kWh summer',
    planId: 'residential_non_tou',
    consumption: 500,
    season: 'summer',
    expectedEnergyCharge: 1395.1, // Calculated manually
    description: 'Tier 1 (120*1.78) + Tier 2 (210*2.55) + Tier 3 (170*3.8)'
  },
  {
    name: 'Residential Non-TOU - 1200 kWh non-summer',
    planId: 'residential_non_tou',
    consumption: 1200,
    season: 'non_summer',
    expectedEnergyCharge: 5055.3, // Tier 1-6: 213.6+474.6+532.1+848+1581+1406
    description: 'All 6 tiers'
  },
  {
    name: 'Residential Simple 2-Tier - Equal distribution',
    planId: 'residential_simple_2_tier',
    consumption: 500,
    season: 'summer',
    touConsumption: { peakOnPeak: 250, semiPeak: 0, offPeak: 250 },
    expectedTotal: 1805, // 250*5.16 + 250*2.06 (energy only)
    description: '500 kWh at mixed rates (50% peak)'
  }
];

function findPlan(planId) {
  return plans.plans.find(p => p.id === planId);
}

function calculateTiered(consumption, tiers, isSummer) {
  let remaining = consumption;
  let lastLimit = 0;
  let total = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;

    const tierEnd = tier.max ?? Infinity;
    const tierLimit = tierEnd - lastLimit;
    const kwhInTier = Math.min(remaining, tierLimit);
    const rate = isSummer ? tier.summer : tier.non_summer;
    const charge = kwhInTier * rate;

    total += charge;
    remaining -= kwhInTier;
    lastLimit = tierEnd;
  }

  return total;
}

function calculateTOU(touConsumption, rates, season) {
  const seasonRates = rates.filter(r => r.season === season);
  let total = 0;

  for (const period of ['peak', 'off_peak', 'semi_peak']) {
    const rate = seasonRates.find(r => r.period === period)?.cost || 0;
    const kwh = touConsumption[period === 'peak' ? 'peakOnPeak' :
                                   period === 'off_peak' ? 'offPeak' : 'semiPeak'] || 0;
    total += kwh * rate;
  }

  return total;
}

console.log('='.repeat(60));
console.log('CALCULATION ACCURACY TEST');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  console.log(`\nTest: ${testCase.name}`);
  console.log(`Description: ${testCase.description}`);

  const plan = findPlan(testCase.planId);
  if (!plan) {
    console.log(`  ❌ Plan not found: ${testCase.planId}`);
    failed++;
    continue;
  }

  let calculated;
  if (plan.tiers) {
    calculated = calculateTiered(testCase.consumption, plan.tiers, testCase.season === 'summer');
  } else if (plan.rates && testCase.touConsumption) {
    calculated = calculateTOU(testCase.touConsumption, plan.rates, testCase.season);
  } else {
    console.log(`  ⚠️  Skipping - unsupported plan type`);
    continue;
  }

  const expected = testCase.expectedEnergyCharge ?? testCase.expectedTotal;
  const diff = Math.abs(calculated - expected);
  const match = diff < 0.1;

  console.log(`  Expected: ${expected.toFixed(2)}`);
  console.log(`  Calculated: ${calculated.toFixed(2)}`);
  console.log(`  Difference: ${diff.toFixed(2)}`);

  if (match) {
    console.log(`  ✅ PASS`);
    passed++;
  } else {
    console.log(`  ❌ FAIL`);
    failed++;
  }
}

console.log('\n' + '='.repeat(60));
console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

process.exit(failed > 0 ? 1 : 0);
