#!/usr/bin/env node

/**
 * Calculation Test Script
 * Tests the rate calculation logic
 */

// Mock the DOM environment for Node.js
global.DOMMatrix = class DOMMatrix {};

async function testCalculations() {
  console.log('=== Calculation Test ===\n');

  try {
    // Import the calculation modules
    const { PlansLoader } = await import('./src/services/calculation/plans.ts');
    const { RateCalculator } = await import('./src/services/calculation/RateCalculator.ts');

    // Load plans
    console.log('Loading plans...');
    const plans = await PlansLoader.getAll();
    console.log(`✓ Loaded ${plans.length} plans\n`);

    // Create calculator
    const calculator = new RateCalculator(plans);

    // Test case 1: Summer consumption
    console.log('Test 1: Summer consumption (350 kWh, July, 10A single phase 110V)');
    const input1 = {
      consumption: 350,
      touConsumption: {
        peakOnPeak: 105,
        semiPeak: 87,
        offPeak: 158,
      },
      billingPeriod: {
        start: new Date(2025, 6, 1), // July
        end: new Date(2025, 6, 31),
        days: 31,
      },
      voltageType: 'low_voltage',
      voltageV: 110,
      phase: 'single',
      contractCapacity: 10,
    };

    const results1 = calculator.calculateAll(input1);
    console.log(`✓ Calculated ${results1.length} results`);
    console.log(`  Cheapest: ${results1[0].planName} - $${results1[0].charges.total.toFixed(0)}`);
    console.log(`  Most expensive: ${results1[results1.length - 1].planName} - $${results1[results1.length - 1].charges.total.toFixed(0)}\n`);

    // Test case 2: Non-summer consumption
    console.log('Test 2: Non-summer consumption (300 kWh, January, 20A single phase 110V)');
    const input2 = {
      consumption: 300,
      billingPeriod: {
        start: new Date(2025, 0, 1), // January
        end: new Date(2025, 0, 31),
        days: 31,
      },
      voltageType: 'low_voltage',
      voltageV: 110,
      phase: 'single',
      contractCapacity: 20,
    };

    const results2 = calculator.calculateAll(input2);
    console.log(`✓ Calculated ${results2.length} results`);
    console.log(`  Cheapest: ${results2[0].planName} - $${results2[0].charges.total.toFixed(0)}`);
    console.log(`  Most expensive: ${results2[results2.length - 1].planName} - $${results2[results2.length - 1].charges.total.toFixed(0)}\n`);

    // Test case 3: High consumption
    console.log('Test 3: High consumption (800 kWh, August, 30A single phase 110V)');
    const input3 = {
      consumption: 800,
      touConsumption: {
        peakOnPeak: 280,
        semiPeak: 200,
        offPeak: 320,
      },
      billingPeriod: {
        start: new Date(2025, 7, 1), // August
        end: new Date(2025, 7, 31),
        days: 31,
      },
      voltageType: 'low_voltage',
      voltageV: 110,
      phase: 'single',
      contractCapacity: 30,
    };

    const results3 = calculator.calculateAll(input3);
    console.log(`✓ Calculated ${results3.length} results`);
    console.log(`  Cheapest: ${results3[0].planName} - $${results3[0].charges.total.toFixed(0)}`);
    console.log(`  Most expensive: ${results3[results3.length - 1].planName} - $${results3[results3.length - 1].charges.total.toFixed(0)}\n`);

    console.log('=== All Calculation Tests Passed ===');

  } catch (error) {
    console.error('Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testCalculations();
