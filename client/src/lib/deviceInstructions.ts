import { DeviceType } from "@shared/schema";

export const deviceInstructions: Record<DeviceType, {
  name: string;
  icon: string;
  steps: string[];
  totalSteps: number;
}> = {
  blood_pressure_monitor: {
    name: "Blood Pressure Monitor",
    icon: "🩺",
    steps: [
      "Wrap the cuff around your upper arm",
      "Position the cuff 1 inch above your elbow",
      "Ensure the cuff is snug but not too tight", 
      "Press the start button to begin measurement",
      "Remain still and quiet during measurement"
    ],
    totalSteps: 5
  },
  infrared_thermometer: {
    name: "Oral Thermometer",
    icon: "🌡️",
    steps: [
      "Turn on the thermometer and wait for the ready signal",
      "Place the tip under your tongue, to the side of your mouth",
      "Close your mouth gently and keep your lips sealed",
      "Wait for the thermometer to beep (usually 30-60 seconds)",
      "Remove and read the temperature display"
    ],
    totalSteps: 5
  },
  blood_glucose_meter: {
    name: "Blood Glucose Meter", 
    icon: "🩸",
    steps: [
      "Insert a test strip into the meter",
      "Clean your fingertip with alcohol",
      "Use the lancet to prick your fingertip", 
      "Touch the drop of blood to the test strip",
      "Wait for the result to appear on screen"
    ],
    totalSteps: 5
  }
};

export const getDeviceInfo = (deviceType: DeviceType) => {
  return deviceInstructions[deviceType];
};
