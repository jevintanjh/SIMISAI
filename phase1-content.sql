INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Prepare the cuff and device',
    'Step 1: Prepare the cuff and device for Blood Pressure Monitor',
    'Remove the blood pressure cuff from its case. Ensure it is clean and properly inflated. Check for any tears or damage to the cuff or tubing.',
    'Do not use if the cuff is damaged or has holes.',
    'Store the device in a cool, dry place when not in use.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.547Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Position the cuff correctly',
    'Step 2: Position the cuff correctly for Blood Pressure Monitor',
    'Wrap the cuff around your upper arm, positioning it so the bottom edge is about 1 inch above your elbow. The cuff should be snug but not tight.',
    'Ensure the cuff is not too tight - you should be able to fit one finger between the cuff and your arm.',
    'Position yourself comfortably with your back supported and feet flat on the floor.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.547Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Start the measurement',
    'Step 3: Start the measurement for Blood Pressure Monitor',
    'Press the start button on the monitor. Sit still with your arm supported at heart level. Do not talk or move during the measurement.',
    'Do not move or talk during measurement as this can affect accuracy.',
    'Take multiple readings at different times of day for a complete picture.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.547Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Read and record results',
    'Step 4: Read and record results for Blood Pressure Monitor',
    'Wait for the beep indicating measurement is complete. Note the systolic and diastolic readings displayed on the screen.',
    'If readings seem unusually high or low, wait 5 minutes and measure again.',
    'Record your readings with the date and time for your healthcare provider.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'blood_pressure_monitor'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Complete and clean up',
    'Step 5: Complete and clean up for Blood Pressure Monitor',
    'Remove the cuff and turn off the device. Clean the cuff with a damp cloth if needed. Store the device in its case.',
    'Always clean the cuff after each use to maintain hygiene.',
    'Replace the batteries when the low battery indicator appears.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Prepare the thermometer',
    'Step 1: Prepare the thermometer for Digital Oral Thermometer',
    'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
    'Do not use if the probe is cracked or damaged.',
    'Keep spare batteries on hand for reliable operation.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Turn on the device',
    'Step 2: Turn on the device for Digital Oral Thermometer',
    'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
    'Wait at least 15 minutes after eating or drinking hot/cold liquids before taking temperature.',
    'Use the same thermometer consistently for accurate tracking.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Position under tongue',
    'Step 3: Position under tongue for Digital Oral Thermometer',
    'Place the probe under your tongue, positioning it as far back as possible. Close your mouth gently and breathe through your nose.',
    'Keep your mouth closed during measurement for accurate results.',
    'Take temperature at the same time each day for consistent monitoring.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Read the temperature',
    'Step 4: Read the temperature for Digital Oral Thermometer',
    'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
    'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
    'Consider taking multiple readings if the first seems unusual.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_oral_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Clean and store device',
    'Step 5: Clean and store device for Digital Oral Thermometer',
    'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
    'Clean the probe thoroughly after each use to prevent contamination.',
    'Store in a clean, dry place away from direct sunlight.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 1),
    'Prepare the thermometer',
    'Step 1: Prepare the thermometer for Digital Ear Thermometer',
    'Remove the thermometer from its case. Check that it is clean and the battery has sufficient power. If needed, clean the probe with alcohol.',
    'Do not use if the probe is cracked or damaged.',
    'Keep spare batteries on hand for reliable operation.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 2),
    'Turn on the device',
    'Step 2: Turn on the device for Digital Ear Thermometer',
    'Press the power button to turn on the device. Wait for the display to show ready or the temperature symbol.',
    'Ensure the ear canal is clean and free of earwax for accurate readings.',
    'Use the same thermometer consistently for accurate tracking.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 3),
    'Position in ear canal',
    'Step 3: Position in ear canal for Digital Ear Thermometer',
    'Gently pull the ear up and back (for adults) or down and back (for children). Insert the probe into the ear canal until it fits snugly.',
    'Position the probe correctly in the ear canal for accurate measurement.',
    'Take temperature at the same time each day for consistent monitoring.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 4),
    'Read the temperature',
    'Step 4: Read the temperature for Digital Ear Thermometer',
    'Wait for the beep indicating measurement is complete. Read the temperature displayed on the screen.',
    'Normal body temperature is typically 98.6°F (37°C). Consult a doctor if temperature is above 100.4°F (38°C).',
    'Consider taking multiple readings if the first seems unusual.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);

INSERT INTO guidance_content (
    device_id, language_id, style_id, step_id,
    step_title, step_description, step_instructions, step_warnings, step_tips,
    is_ai_generated, generated_by_ai_provider, generation_quality_score, generated_at
) VALUES (
    (SELECT device_id FROM device_types WHERE device_key = 'digital_ear_thermometer'),
    (SELECT language_id FROM supported_languages WHERE language_code = 'en'),
    (SELECT style_id FROM guidance_styles WHERE style_key = 'direct'),
    (SELECT step_id FROM guidance_steps WHERE step_number = 5),
    'Clean and store device',
    'Step 5: Clean and store device for Digital Ear Thermometer',
    'Remove the thermometer and turn it off. Clean the probe with alcohol and return to its case.',
    'Clean the probe thoroughly after each use to prevent contamination.',
    'Store in a clean, dry place away from direct sunlight.',
    true,
    'SIMISAI-Phase1',
    0.95,
    '2025-09-14T16:18:21.548Z'
);