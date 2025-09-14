/**
 * Phase 1 Content Generator
 * Generates 15 guidance entries: 3 devices × 5 steps × English + Direct style
 */

import fs from 'fs';

const devices = [
    'blood_pressure_monitor',
    'digital_oral_thermometer', 
    'digital_ear_thermometer'
];

const steps = [1, 2, 3, 4, 5];

const stepNames = {
    1: 'Preparation',
    2: 'Setup', 
    3: 'Measurement',
    4: 'Reading',
    5: 'Completion'
};

const deviceNames = {
    'blood_pressure_monitor': 'Blood Pressure Monitor',
    'digital_oral_thermometer': 'Digital Oral Thermometer',
    'digital_ear_thermometer': 'Digital Ear Thermometer'
};

const deviceInstructions = {
    'blood_pressure_monitor': {
        1: 'Prepare the cuff and device',
        2: 'Position the cuff correctly', 
        3: 'Start the measurement',
        4: 'Read and record results',
        5: 'Complete and clean up'
    },
    'digital_oral_thermometer': {
        1: 'Prepare the thermometer',
        2: 'Turn on the device',
        3: 'Position under tongue',
        4: 'Read the temperature',
        5: 'Clean and store device'
    },
    'digital_ear_thermometer': {
        1: 'Prepare the thermometer',
        2: 'Turn on the device', 
        3: 'Position in ear canal',
        4: 'Read the temperature',
        5: 'Clean and store device'
    }
};

// Generate Phase 1 content
const phase1Content = [];

devices.forEach(device => {
    steps.forEach(step => {
        const content = {
            device_key: device,
            device_name: deviceNames[device],
            language_code: 'en',
            style_key: 'direct',
            step_number: step,
            step_name: stepNames[step],
            step_title: deviceInstructions[device][step],
            step_description: `Step ${step}: ${deviceInstructions[device][step]} for ${deviceNames[device]}`,
            step_instructions: generateInstructions(device, step),
            step_warnings: generateWarnings(device, step),
            step_tips: generateTips(device, step),
            is_ai_generated: true,
            generated_by_ai_provider: 'SIMISAI-Phase1',
            generation_quality_score: 0.95,
            generated_at: new Date().toISOString()
        };
        
        phase1Content.push(content);
    });
});

function generateInstructions(device, step) {
    const instructions = {
        'blood_pressure_monitor': {
            1: 'Remove the blood pressure cuff from its case. Ensure it is clean and properly inflated. Check for any tears or damage to the cuff or tubing.',
            2: 'Wrap the cuff around your upper arm, positioning it so the bottom edge is about 1 inch above your elbow. The cuff should be snug but not tight.',
            3: 'Press the start button on the monitor. Sit still with your arm supported at heart level. Do not talk or move during the measurement.',
            4: 'Wait for the beep indicating measurement is complete. Note the systolic and diastolic readings displayed on the screen.',
            5: 'Remove the cuff and turn off the device. Clean the cuff with a damp cloth if needed. Store the device in its case.'
        },
        'digital_oral_thermometer': {
            1: 'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
            2: 'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
            3: 'Place the probe under your tongue, positioning it as far back as possible. Close your mouth gently and breathe through your nose.',
            4: 'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
            5: 'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.'
        },
        'digital_ear_thermometer': {
            1: 'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
            2: 'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
            3: 'Gently pull the ear up and back (for adults) or down and back (for children). Insert the probe into the ear canal until it fits snugly.',
            4: 'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
            5: 'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.'
        }
    };
    
    return instructions[device][step];
}

function generateWarnings(device, step) {
    const warnings = {
        'blood_pressure_monitor': {
            1: 'Do not use if the cuff is damaged or has holes.',
            2: 'Ensure the cuff is not too tight - you should be able to fit one finger between the cuff and your arm.',
            3: 'Do not move or talk during measurement as this can affect accuracy.',
            4: 'If readings seem unusually high or low, wait 5 minutes and measure again.',
            5: 'Always clean the cuff after each use to maintain hygiene.'
        },
        'digital_oral_thermometer': {
            1: 'Do not use if the probe is cracked or damaged.',
            2: 'Wait at least 15 minutes after eating or drinking hot/cold liquids before taking temperature.',
            3: 'Keep your mouth closed during measurement for accurate results.',
            4: 'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
            5: 'Clean the probe thoroughly after each use to prevent contamination.'
        },
        'digital_ear_thermometer': {
            1: 'Do not use if the probe is cracked or damaged.',
            2: 'Ensure the ear canal is clean and free of earwax for accurate readings.',
            3: 'Position the probe correctly in the ear canal for accurate measurement.',
            4: 'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
            5: 'Clean the probe thoroughly after each use to prevent contamination.'
        }
    };
    
    return warnings[device][step];
}

function generateTips(device, step) {
    const tips = {
        'blood_pressure_monitor': {
            1: 'Store the device in a cool, dry place when not in use.',
            2: 'Position yourself comfortably with your back supported and feet flat on the floor.',
            3: 'Take multiple readings at different times of day for a complete picture.',
            4: 'Record your readings with the date and time for your healthcare provider.',
            5: 'Replace the batteries when the low battery indicator appears.'
        },
        'digital_oral_thermometer': {
            1: 'Keep spare batteries on hand for reliable operation.',
            2: 'Use the same thermometer consistently for accurate tracking.',
            3: 'Take temperature at the same time each day for consistent monitoring.',
            4: 'Consider taking multiple readings if the first seems unusual.',
            5: 'Store in a clean, dry place away from direct sunlight.'
        },
        'digital_ear_thermometer': {
            1: 'Keep spare batteries on hand for reliable operation.',
            2: 'Use the same thermometer consistently for accurate tracking.',
            3: 'Take temperature at the same time each day for consistent monitoring.',
            4: 'Consider taking multiple readings if the first seems unusual.',
            5: 'Store in a clean, dry place away from direct sunlight.'
        }
    };
    
    return tips[device][step];
}

// Output the generated content
console.log('Phase 1 Content Generated:');
console.log(`Total entries: ${phase1Content.length}`);
console.log('\nContent Preview:');
phase1Content.slice(0, 3).forEach((content, index) => {
    console.log(`\n${index + 1}. ${content.device_name} - Step ${content.step_number}: ${content.step_title}`);
    console.log(`   Instructions: ${content.step_instructions.substring(0, 100)}...`);
    console.log(`   Warnings: ${content.step_warnings.substring(0, 80)}...`);
    console.log(`   Tips: ${content.step_tips.substring(0, 80)}...`);
});

// Save to file
fs.writeFileSync('phase1-content.json', JSON.stringify(phase1Content, null, 2));
console.log('\n✅ Phase 1 content saved to phase1-content.json');

// Generate SQL insert statements
const sqlStatements = phase1Content.map(content => {
    return `INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = '${content.device_key}'),
    (SELECT language_id FROM supported_languages WHERE language_code = '${content.language_code}'),
    (SELECT style_id FROM guidance_styles WHERE style_key = '${content.style_key}'),
    (SELECT step_id FROM guidance_steps WHERE step_number = ${content.step_number}),
    '${content.step_title.replace(/'/g, "''")}',
    '${content.step_description.replace(/'/g, "''")}',
    '${content.step_instructions.replace(/'/g, "''")}',
    '${content.step_warnings.replace(/'/g, "''")}',
    '${content.step_tips.replace(/'/g, "''")}',
    ${content.is_ai_generated},
    '${content.generated_by_ai_provider}',
    ${content.generation_quality_score},
    '${content.generated_at}'
);`;
});

fs.writeFileSync('phase1-content.sql', sqlStatements.join('\n\n'));
console.log('✅ Phase 1 SQL insert statements saved to phase1-content.sql');

console.log('\n🚀 Phase 1 Generation Complete!');
console.log('📊 Generated 15 guidance entries for English + Direct style');
console.log('💾 Ready for database insertion');
