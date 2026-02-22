#!/usr/bin/env node
/**
 * Check which plans pass the filter
 */

const response = await fetch('http://localhost:5173/taipower-tou-web/data/plans.json');
const data = await response.json();

console.log('All plans:');
data.plans.forEach(p => {
  const isResidentialOrLighting = p.category === 'lighting' || p.category === 'residential';
  const hasBusiness = p.id.includes('business') || p.id.includes('營業');
  const hasEV = p.id.includes('ev') || p.id.includes('電動車');
  const hasBatch = p.id.includes('batch') || p.id.includes('批次');
  const wouldPass = isResidentialOrLighting && !hasBusiness && !hasEV && !hasBatch;

  console.log(` ${wouldPass ? 'PASS' : 'SKIP'} ${p.id}`, `cat=${p.category}`, `bus=${hasBusiness}`, `ev=${hasEV}`, `batch=${hasBatch}`);
});

const passingPlans = data.plans.filter(p => {
  const isResidentialOrLighting = p.category === 'lighting' || p.category === 'residential';
  const hasBusiness = p.id.includes('business') || p.id.includes('營業');
  const hasEV = p.id.includes('ev') || p.id.includes('電動車');
  const hasBatch = p.id.includes('batch') || p.id.includes('批次');
  return isResidentialOrLighting && !hasBusiness && !hasEV && !hasBatch;
});

console.log(`\nTotal plans: ${data.plans.length}`);
console.log(`Passing plans: ${passingPlans.length}`);
