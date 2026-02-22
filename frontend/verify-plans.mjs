#!/usr/bin/env node
/**
 * Verify which plans should be displayed based on actual filter logic
 */

const response = await fetch('http://localhost:5173/taipower-tou-web/data/plans.json');
const data = await response.json();

// Simulate the actual filter logic from RateCalculator.getAvailablePlans()
const passingPlans = data.plans.filter((plan) => {
  const isResidential = plan.category === 'lighting' ||
                       plan.category === 'residential' ||
                       plan.category === 'low_voltage';

  if (!isResidential) return false;

  const isBusiness = plan.id.includes('business') ||
                    plan.name.includes('營業');
  if (isBusiness) return false;

  if (plan.id.includes('ev') || plan.id.includes('電動車')) return false;

  if (plan.id.includes('batch') || plan.id.includes('批次')) return false;

  return true;
});

console.log('Plans that should be displayed:');
passingPlans.forEach((p, i) => console.log(`  ${i + 1}. ${p.name} (${p.id})`));
console.log(`\nTotal: ${passingPlans.length}`);

// Check TOU types
const byTOUType = {
  non_tou: passingPlans.filter(p => p.type === 'TIERED'),
  simple_2_tier: passingPlans.filter(p => p.id.includes('simple_2_tier')),
  simple_3_tier: passingPlans.filter(p => p.id.includes('simple_3_tier')),
  standard_2_tier: passingPlans.filter(p => p.id.includes('standard_2_tier')),
  standard_3_tier: passingPlans.filter(p => p.id.includes('standard_3_tier')),
};

console.log('\nBy TOU type:');
console.log('  非時間電價:', byTOUType.non_tou.length);
byTOUType.non_tou.forEach(p => console.log('    -', p.name));

console.log('\n  簡易型二段式:', byTOUType.simple_2_tier.length);
byTOUType.simple_2_tier.forEach(p => console.log('    -', p.name));

console.log('\n  簡易型三段式:', byTOUType.simple_3_tier.length);
byTOUType.simple_3_tier.forEach(p => console.log('    -', p.name));

console.log('\n  標準型二段式:', byTOUType.standard_2_tier.length);
byTOUType.standard_2_tier.forEach(p => console.log('    -', p.name));

console.log('\n  標準型三段式:', byTOUType.standard_3_tier.length);
byTOUType.standard_3_tier.forEach(p => console.log('    -', p.name));
