#!/usr/bin/env node
/**
 * Check low_voltage_power plan data
 */

const response = await fetch('http://localhost:5173/taipower-tou-web/data/plans.json');
const data = await response.json();

const lowVoltagePower = data.plans.find(p => p.id === 'low_voltage_power');

console.log('low_voltage_power plan data:');
console.log(JSON.stringify(lowVoltagePower, null, 2));

console.log('\nRates (should have flat rate):');
lowVoltagePower.rates.forEach(r => {
  console.log(`  ${r.season} - ${r.period}: $${r.cost}/kWh`);
});

console.log('\nBasic fees:');
lowVoltagePower.basic_fees.forEach(f => {
  console.log(`  ${f.label}: ${f.cost || f.summer || f.non_summer} ${f.unit}`);
});
