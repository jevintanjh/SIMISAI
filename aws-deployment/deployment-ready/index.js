// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  devices;
  instructions;
  chatMessages;
  guidanceSessions;
  constructor() {
    this.devices = /* @__PURE__ */ new Map();
    this.instructions = /* @__PURE__ */ new Map();
    this.chatMessages = /* @__PURE__ */ new Map();
    this.guidanceSessions = /* @__PURE__ */ new Map();
    this.initializeSampleData();
  }
  initializeSampleData() {
    const bpMonitor = {
      id: randomUUID(),
      name: "Digital BP Monitor",
      type: "bp_monitor",
      stepCount: 5,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Automated blood pressure monitoring device"
    };
    const glucoseMeter = {
      id: randomUUID(),
      name: "Glucose Meter",
      type: "glucose_meter",
      stepCount: 4,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Blood glucose monitoring device"
    };
    const thermometer = {
      id: randomUUID(),
      name: "Digital Thermometer",
      type: "thermometer",
      stepCount: 5,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Digital oral thermometer for temperature measurement"
    };
    this.devices.set(bpMonitor.id, bpMonitor);
    this.devices.set(glucoseMeter.id, glucoseMeter);
    this.devices.set(thermometer.id, thermometer);
    const bpInstructions = [
      {
        id: randomUUID(),
        deviceId: bpMonitor.id,
        stepNumber: 1,
        title: "Prepare the Device",
        description: "Ensure the blood pressure monitor is on a stable surface and plugged in or has sufficient battery.",
        translations: {
          "id": {
            title: "Persiapkan Perangkat",
            description: "Pastikan monitor tekanan darah berada di permukaan yang stabil dan terpasang atau memiliki baterai yang cukup."
          },
          "th": {
            title: "\u0E40\u0E15\u0E23\u0E35\u0E22\u0E21\u0E2D\u0E38\u0E1B\u0E01\u0E23\u0E13\u0E4C",
            description: "\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E43\u0E2B\u0E49\u0E41\u0E19\u0E48\u0E43\u0E08\u0E27\u0E48\u0E32\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E27\u0E31\u0E14\u0E04\u0E27\u0E32\u0E21\u0E14\u0E31\u0E19\u0E42\u0E25\u0E2B\u0E34\u0E15\u0E2D\u0E22\u0E39\u0E48\u0E1A\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E1C\u0E34\u0E27\u0E17\u0E35\u0E48\u0E21\u0E31\u0E48\u0E19\u0E04\u0E07\u0E41\u0E25\u0E30\u0E40\u0E2A\u0E35\u0E22\u0E1A\u0E1B\u0E25\u0E31\u0E4A\u0E01\u0E2B\u0E23\u0E37\u0E2D\u0E21\u0E35\u0E41\u0E1A\u0E15\u0E40\u0E15\u0E2D\u0E23\u0E35\u0E48\u0E40\u0E1E\u0E35\u0E22\u0E07\u0E1E\u0E2D"
          },
          "vi": {
            title: "Chu\u1EA9n b\u1ECB thi\u1EBFt b\u1ECB",
            description: "\u0110\u1EA3m b\u1EA3o m\xE1y \u0111o huy\u1EBFt \xE1p \u0111\u01B0\u1EE3c \u0111\u1EB7t tr\xEAn b\u1EC1 m\u1EB7t \u1ED5n \u0111\u1ECBnh v\xE0 \u0111\u01B0\u1EE3c c\u1EAFm \u0111i\u1EC7n ho\u1EB7c c\xF3 \u0111\u1EE7 pin."
          },
          "fil": {
            title: "Ihanda ang Aparato",
            description: "Siguraduhin na ang blood pressure monitor ay nasa stable na surface at nakakabit o may sapat na battery."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Device powered on", "Stable surface"]
      },
      {
        id: randomUUID(),
        deviceId: bpMonitor.id,
        stepNumber: 2,
        title: "Wrap the Cuff Around Your Arm",
        description: "Place the cuff around your upper arm, about 1 inch above your elbow. The cuff should be snug but not too tight.",
        translations: {
          "id": {
            title: "Lingkarkan Manset di Lengan Anda",
            description: "Lingkarkan manset di sekitar lengan atas Anda, sekitar 1 inci di atas siku. Manset harus pas tetapi tidak terlalu ketat."
          },
          "th": {
            title: "\u0E1E\u0E31\u0E19\u0E02\u0E49\u0E2D\u0E21\u0E37\u0E2D\u0E23\u0E2D\u0E1A\u0E41\u0E02\u0E19",
            description: "\u0E27\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E37\u0E2D\u0E23\u0E2D\u0E1A\u0E15\u0E49\u0E19\u0E41\u0E02\u0E19\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13 \u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 1 \u0E19\u0E34\u0E49\u0E27\u0E40\u0E2B\u0E19\u0E37\u0E2D\u0E02\u0E49\u0E2D\u0E28\u0E2D\u0E01 \u0E02\u0E49\u0E2D\u0E21\u0E37\u0E2D\u0E04\u0E27\u0E23\u0E1E\u0E2D\u0E14\u0E35\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E41\u0E19\u0E48\u0E19\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B"
          },
          "vi": {
            title: "Qu\u1EA5n v\xF2ng b\xEDt quanh c\xE1nh tay",
            description: "\u0110\u1EB7t v\xF2ng b\xEDt quanh c\xE1nh tay tr\xEAn c\u1EE7a b\u1EA1n, c\xE1ch khu\u1EF7u tay kho\u1EA3ng 1 inch. V\xF2ng b\xEDt ph\u1EA3i v\u1EEBa kh\xEDt nh\u01B0ng kh\xF4ng qu\xE1 ch\u1EB7t."
          },
          "fil": {
            title: "Ikabit ang Cuff sa Braso",
            description: "Ilagay ang cuff sa paligid ng inyong upper arm, mga 1 pulgada sa itaas ng siko. Ang cuff ay dapat makakasya ngunit hindi masyadong mahigpit."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Cuff positioned correctly", "Proper tightness"]
      }
    ];
    bpInstructions.forEach((instruction) => {
      this.instructions.set(instruction.id, instruction);
    });
    const thermometerInstructions = [
      {
        id: randomUUID(),
        deviceId: thermometer.id,
        stepNumber: 1,
        title: "Turn on the thermometer and wait for the ready signal",
        description: "Press the power button on your digital thermometer and wait for the display to show the ready signal (usually a beep or specific icon).",
        translations: {
          "id": {
            title: "Nyalakan termometer dan tunggu sinyal siap",
            description: "Tekan tombol power pada termometer digital Anda dan tunggu layar menampilkan sinyal siap (biasanya bunyi beep atau ikon tertentu)."
          },
          "th": {
            title: "\u0E40\u0E1B\u0E34\u0E14\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E41\u0E25\u0E30\u0E23\u0E2D\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E1E\u0E23\u0E49\u0E2D\u0E21",
            description: "\u0E01\u0E14\u0E1B\u0E38\u0E48\u0E21\u0E40\u0E1B\u0E34\u0E14\u0E40\u0E04\u0E23\u0E37\u0E48\u0E2D\u0E07\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E14\u0E34\u0E08\u0E34\u0E15\u0E2D\u0E25\u0E41\u0E25\u0E30\u0E23\u0E2D\u0E43\u0E2B\u0E49\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D\u0E41\u0E2A\u0E14\u0E07\u0E2A\u0E31\u0E0D\u0E0D\u0E32\u0E13\u0E1E\u0E23\u0E49\u0E2D\u0E21 (\u0E21\u0E31\u0E01\u0E08\u0E30\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E2A\u0E35\u0E22\u0E07\u0E1A\u0E35\u0E4A\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E44\u0E2D\u0E04\u0E2D\u0E19\u0E40\u0E09\u0E1E\u0E32\u0E30)"
          },
          "vi": {
            title: "B\u1EADt nhi\u1EC7t k\u1EBF v\xE0 ch\u1EDD t\xEDn hi\u1EC7u s\u1EB5n s\xE0ng",
            description: "Nh\u1EA5n n\xFAt ngu\u1ED3n tr\xEAn nhi\u1EC7t k\u1EBF k\u1EF9 thu\u1EADt s\u1ED1 v\xE0 ch\u1EDD m\xE0n h\xECnh hi\u1EC3n th\u1ECB t\xEDn hi\u1EC7u s\u1EB5n s\xE0ng (th\u01B0\u1EDDng l\xE0 ti\u1EBFng beep ho\u1EB7c bi\u1EC3u t\u01B0\u1EE3ng c\u1EE5 th\u1EC3)."
          },
          "fil": {
            title: "I-on ang thermometer at maghintay ng ready signal",
            description: "Pindutin ang power button sa inyong digital thermometer at maghintay na magpakita ang display ng ready signal (karaniwang beep o specific na icon)."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Power button pressed", "Ready signal displayed"]
      },
      {
        id: randomUUID(),
        deviceId: thermometer.id,
        stepNumber: 2,
        title: "Place the tip under your tongue, to the side of your mouth",
        description: "Gently place the thermometer tip under your tongue, positioning it to the side of your mouth for accurate readings.",
        translations: {
          "id": {
            title: "Tempatkan ujung termometer di bawah lidah, ke samping mulut",
            description: "Tempatkan ujung termometer dengan lembut di bawah lidah, posisikan ke samping mulut untuk pembacaan yang akurat."
          },
          "th": {
            title: "\u0E27\u0E32\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E43\u0E15\u0E49\u0E25\u0E34\u0E49\u0E19 \u0E14\u0E49\u0E32\u0E19\u0E02\u0E49\u0E32\u0E07\u0E1B\u0E32\u0E01",
            description: "\u0E27\u0E32\u0E07\u0E1B\u0E25\u0E32\u0E22\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E40\u0E1A\u0E32\u0E46 \u0E43\u0E15\u0E49\u0E25\u0E34\u0E49\u0E19 \u0E42\u0E14\u0E22\u0E27\u0E32\u0E07\u0E44\u0E27\u0E49\u0E14\u0E49\u0E32\u0E19\u0E02\u0E49\u0E32\u0E07\u0E1B\u0E32\u0E01\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E48\u0E32\u0E17\u0E35\u0E48\u0E41\u0E21\u0E48\u0E19\u0E22\u0E33"
          },
          "vi": {
            title: "\u0110\u1EB7t \u0111\u1EA7u nhi\u1EC7t k\u1EBF d\u01B0\u1EDBi l\u01B0\u1EE1i, b\xEAn c\u1EA1nh mi\u1EC7ng",
            description: "Nh\u1EB9 nh\xE0ng \u0111\u1EB7t \u0111\u1EA7u nhi\u1EC7t k\u1EBF d\u01B0\u1EDBi l\u01B0\u1EE1i, \u0111\u1ECBnh v\u1ECB b\xEAn c\u1EA1nh mi\u1EC7ng \u0111\u1EC3 c\xF3 k\u1EBFt qu\u1EA3 \u0111\u1ECDc ch\xEDnh x\xE1c."
          },
          "fil": {
            title: "Ilagay ang tip ng thermometer sa ilalim ng dila, sa gilid ng bibig",
            description: "Dahan-dahang ilagay ang tip ng thermometer sa ilalim ng dila, iposisyon ito sa gilid ng bibig para sa tumpak na pagbabasa."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Tip positioned under tongue", "Positioned to the side"]
      },
      {
        id: randomUUID(),
        deviceId: thermometer.id,
        stepNumber: 3,
        title: "Close your mouth gently and keep your lips sealed",
        description: "Close your mouth gently around the thermometer, ensuring your lips are sealed to prevent air from affecting the reading.",
        translations: {
          "id": {
            title: "Tutup mulut dengan lembut dan jaga bibir tetap tertutup",
            description: "Tutup mulut dengan lembut di sekitar termometer, pastikan bibir tetap tertutup untuk mencegah udara mempengaruhi pembacaan."
          },
          "th": {
            title: "\u0E1B\u0E34\u0E14\u0E1B\u0E32\u0E01\u0E40\u0E1A\u0E32\u0E46 \u0E41\u0E25\u0E30\u0E1B\u0E34\u0E14\u0E23\u0E34\u0E21\u0E1D\u0E35\u0E1B\u0E32\u0E01\u0E43\u0E2B\u0E49\u0E2A\u0E19\u0E34\u0E17",
            description: "\u0E1B\u0E34\u0E14\u0E1B\u0E32\u0E01\u0E40\u0E1A\u0E32\u0E46 \u0E23\u0E2D\u0E1A\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C \u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E43\u0E2B\u0E49\u0E41\u0E19\u0E48\u0E43\u0E08\u0E27\u0E48\u0E32\u0E23\u0E34\u0E21\u0E1D\u0E35\u0E1B\u0E32\u0E01\u0E1B\u0E34\u0E14\u0E2A\u0E19\u0E34\u0E17\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E1B\u0E49\u0E2D\u0E07\u0E01\u0E31\u0E19\u0E44\u0E21\u0E48\u0E43\u0E2B\u0E49\u0E2D\u0E32\u0E01\u0E32\u0E28\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E15\u0E48\u0E2D\u0E01\u0E32\u0E23\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E48\u0E32"
          },
          "vi": {
            title: "Nh\u1EAFm mi\u1EC7ng nh\u1EB9 nh\xE0ng v\xE0 gi\u1EEF m\xF4i kh\xE9p k\xEDn",
            description: "Nh\u1EAFm mi\u1EC7ng nh\u1EB9 nh\xE0ng xung quanh nhi\u1EC7t k\u1EBF, \u0111\u1EA3m b\u1EA3o m\xF4i kh\xE9p k\xEDn \u0111\u1EC3 ng\u0103n kh\xF4ng kh\xED \u1EA3nh h\u01B0\u1EDFng \u0111\u1EBFn k\u1EBFt qu\u1EA3 \u0111\u1ECDc."
          },
          "fil": {
            title: "Isara ang bibig nang dahan-dahan at panatilihing nakasara ang mga labi",
            description: "Isara ang bibig nang dahan-dahan sa paligid ng thermometer, tiyaking nakasara ang mga labi para maiwasan na maapektuhan ng hangin ang pagbabasa."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Mouth closed gently", "Lips sealed properly"]
      },
      {
        id: randomUUID(),
        deviceId: thermometer.id,
        stepNumber: 4,
        title: "Wait for the thermometer to beep (usually 30-60 seconds)",
        description: "Hold the thermometer in place and wait for the beep sound that indicates the measurement is complete.",
        translations: {
          "id": {
            title: "Tunggu termometer berbunyi beep (biasanya 30-60 detik)",
            description: "Tahan termometer di tempat dan tunggu suara beep yang menandakan pengukuran selesai."
          },
          "th": {
            title: "\u0E23\u0E2D\u0E43\u0E2B\u0E49\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2A\u0E48\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E07\u0E1A\u0E35\u0E4A\u0E1A (\u0E42\u0E14\u0E22\u0E1B\u0E01\u0E15\u0E34 30-60 \u0E27\u0E34\u0E19\u0E32\u0E17\u0E35)",
            description: "\u0E16\u0E37\u0E2D\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E44\u0E27\u0E49\u0E43\u0E19\u0E15\u0E33\u0E41\u0E2B\u0E19\u0E48\u0E07\u0E40\u0E14\u0E34\u0E21\u0E41\u0E25\u0E30\u0E23\u0E2D\u0E40\u0E2A\u0E35\u0E22\u0E07\u0E1A\u0E35\u0E4A\u0E1A\u0E17\u0E35\u0E48\u0E1A\u0E48\u0E07\u0E1A\u0E2D\u0E01\u0E27\u0E48\u0E32\u0E01\u0E32\u0E23\u0E27\u0E31\u0E14\u0E40\u0E2A\u0E23\u0E47\u0E08\u0E2A\u0E34\u0E49\u0E19\u0E41\u0E25\u0E49\u0E27"
          },
          "vi": {
            title: "Gi\u1EEF nhi\u1EC7t k\u1EBF t\u1EA1i ch\u1ED7 v\xE0 ch\u1EDD ti\u1EBFng beep cho bi\u1EBFt vi\u1EC7c \u0111o \u0111\xE3 ho\xE0n th\xE0nh.",
            description: "Gi\u1EEF nhi\u1EC7t k\u1EBF t\u1EA1i ch\u1ED7 v\xE0 ch\u1EDD ti\u1EBFng beep cho bi\u1EBFt vi\u1EC7c \u0111o \u0111\xE3 ho\xE0n th\xE0nh."
          },
          "fil": {
            title: "Maghintay na mag-beep ang thermometer (karaniwang 30-60 segundo)",
            description: "Hawakan ang thermometer sa lugar at maghintay ng beep sound na nagpapahiwatig na tapos na ang pagsukat."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Thermometer held in place", "Beep sound heard"]
      },
      {
        id: randomUUID(),
        deviceId: thermometer.id,
        stepNumber: 5,
        title: "Remove and read the temperature display",
        description: "Carefully remove the thermometer from your mouth and read the temperature displayed on the screen.",
        translations: {
          "id": {
            title: "Angkat dan baca tampilan suhu",
            description: "Angkat termometer dengan hati-hati dari mulut dan baca suhu yang ditampilkan di layar."
          },
          "th": {
            title: "\u0E19\u0E33\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2D\u0E2D\u0E01\u0E41\u0E25\u0E30\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E48\u0E32\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07",
            description: "\u0E19\u0E33\u0E40\u0E17\u0E2D\u0E23\u0E4C\u0E42\u0E21\u0E21\u0E34\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E2D\u0E2D\u0E01\u0E08\u0E32\u0E01\u0E1B\u0E32\u0E01\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E23\u0E30\u0E21\u0E31\u0E14\u0E23\u0E30\u0E27\u0E31\u0E07\u0E41\u0E25\u0E30\u0E2D\u0E48\u0E32\u0E19\u0E04\u0E48\u0E32\u0E2D\u0E38\u0E13\u0E2B\u0E20\u0E39\u0E21\u0E34\u0E17\u0E35\u0E48\u0E41\u0E2A\u0E14\u0E07\u0E1A\u0E19\u0E2B\u0E19\u0E49\u0E32\u0E08\u0E2D"
          },
          "vi": {
            title: "L\u1EA5y nhi\u1EC7t k\u1EBF ra kh\u1ECFi mi\u1EC7ng v\xE0 \u0111\u1ECDc nhi\u1EC7t \u0111\u1ED9 hi\u1EC3n th\u1ECB tr\xEAn m\xE0n h\xECnh.",
            description: "L\u1EA5y nhi\u1EC7t k\u1EBF ra kh\u1ECFi mi\u1EC7ng v\xE0 \u0111\u1ECDc nhi\u1EC7t \u0111\u1ED9 hi\u1EC3n th\u1ECB tr\xEAn m\xE0n h\xECnh."
          },
          "fil": {
            title: "Alisin at basahin ang temperature display",
            description: "Maingat na alisin ang thermometer sa bibig at basahin ang temperatura na ipinapakita sa screen."
          }
        },
        audioUrl: null,
        imageUrl: null,
        checkpoints: ["Thermometer removed safely", "Temperature read correctly"]
      }
    ];
    thermometerInstructions.forEach((instruction) => {
      this.instructions.set(instruction.id, instruction);
    });
  }
  async getDevices() {
    return Array.from(this.devices.values()).filter((device) => device.isActive);
  }
  async getDevice(id) {
    return this.devices.get(id);
  }
  async createDevice(insertDevice) {
    const id = randomUUID();
    const device = {
      ...insertDevice,
      id,
      description: insertDevice.description ?? null,
      isActive: insertDevice.isActive ?? true,
      imageUrl: insertDevice.imageUrl ?? null
    };
    this.devices.set(id, device);
    return device;
  }
  async getInstructionsByDevice(deviceId) {
    return Array.from(this.instructions.values()).filter((instruction) => instruction.deviceId === deviceId).sort((a, b) => a.stepNumber - b.stepNumber);
  }
  async getInstruction(deviceId, stepNumber) {
    return Array.from(this.instructions.values()).find((instruction) => instruction.deviceId === deviceId && instruction.stepNumber === stepNumber);
  }
  async createInstruction(insertInstruction) {
    const id = randomUUID();
    const instruction = {
      ...insertInstruction,
      id,
      translations: insertInstruction.translations ?? null,
      audioUrl: insertInstruction.audioUrl ?? null,
      imageUrl: insertInstruction.imageUrl ?? null,
      checkpoints: insertInstruction.checkpoints ? Array.from(insertInstruction.checkpoints) : null
    };
    this.instructions.set(id, instruction);
    return instruction;
  }
  async getChatMessages(sessionId) {
    return Array.from(this.chatMessages.values()).filter((message) => message.sessionId === sessionId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  async createChatMessage(insertMessage) {
    const id = randomUUID();
    const message = {
      ...insertMessage,
      id,
      language: insertMessage.language ?? "en",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.chatMessages.set(id, message);
    return message;
  }
  async getGuidanceSession(id) {
    return this.guidanceSessions.get(id);
  }
  async createGuidanceSession(insertSession) {
    const id = randomUUID();
    const session = {
      ...insertSession,
      id,
      currentStep: insertSession.currentStep ?? 1,
      language: insertSession.language ?? "en",
      completedAt: insertSession.completedAt ?? null,
      isCompleted: insertSession.isCompleted ?? false,
      startedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.guidanceSessions.set(id, session);
    return session;
  }
  async updateGuidanceSession(id, updates) {
    const session = this.guidanceSessions.get(id);
    if (!session) return void 0;
    const updatedSession = { ...session, ...updates };
    this.guidanceSessions.set(id, updatedSession);
    return updatedSession;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  // "bp_monitor", "glucose_meter", etc.
  stepCount: integer("step_count").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url"),
  description: text("description")
});
var instructions = pgTable("instructions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  translations: jsonb("translations").$type(),
  audioUrl: text("audio_url"),
  imageUrl: text("image_url"),
  checkpoints: jsonb("checkpoints").$type()
});
var chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  language: text("language").notNull().default("en"),
  timestamp: text("timestamp").notNull().default(sql`now()`)
});
var guidanceSessions = pgTable("guidance_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").notNull().references(() => devices.id),
  currentStep: integer("current_step").notNull().default(1),
  language: text("language").notNull().default("en"),
  startedAt: text("started_at").notNull().default(sql`now()`),
  completedAt: text("completed_at"),
  isCompleted: boolean("is_completed").notNull().default(false)
});
var insertDeviceSchema = createInsertSchema(devices).omit({ id: true });
var insertInstructionSchema = createInsertSchema(instructions).omit({ id: true });
var insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
var insertGuidanceSessionSchema = createInsertSchema(guidanceSessions).omit({ id: true, startedAt: true });

// server/routes.ts
import { z } from "zod";

// server/cv-service.ts
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
var CVService = class {
  modelPath;
  pythonScript;
  constructor() {
    const modelPath = process.env.CV_MODEL_PATH;
    if (modelPath && modelPath.includes("/") && !modelPath.includes("cv_model")) {
      this.modelPath = modelPath;
      console.log(`Using Hugging Face model: ${modelPath}`);
    } else {
      this.modelPath = path.resolve(process.cwd(), "cv_model/models/poc2/best.pt");
      console.log(`Using local model: ${this.modelPath}`);
    }
    this.pythonScript = path.resolve(process.cwd(), "cv_model/detect_screen.py");
    console.log("CV Service initialized with:");
    console.log(`- Model path: ${this.modelPath}`);
    console.log(`- Python script: ${this.pythonScript}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }
  /**
   * Process an image and return detections
   * This is where you implement your CV logic
   */
  async detectObjects(imagePath) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const env = {
        ...process.env,
        HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN || "",
        HF_HUB_TOKEN: process.env.HUGGINGFACE_TOKEN || ""
      };
      const pythonProcess = spawn("python", [
        this.pythonScript,
        "--model",
        this.modelPath,
        "--image",
        imagePath,
        "--conf",
        "0.5",
        "--output",
        "json"
      ], { env });
      let output = "";
      let errorOutput = "";
      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });
      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
      pythonProcess.on("close", (code) => {
        const processingTime = Date.now() - startTime;
        if (code !== 0) {
          console.error("Python script error:", errorOutput);
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
          return;
        }
        try {
          const result = JSON.parse(output);
          resolve({
            detections: result.detections || [],
            processing_time: processingTime,
            image_size: result.image_size || [0, 0]
          });
        } catch (error) {
          reject(new Error(`Failed to parse Python output: ${error}`));
        }
      });
      pythonProcess.on("error", (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });
    });
  }
  /**
   * Process base64 image data
   */
  async detectObjectsFromBase64(base64Data) {
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, "");
    const tempDir = path.resolve(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const tempImagePath = path.join(tempDir, `temp_${Date.now()}.jpg`);
    try {
      fs.writeFileSync(tempImagePath, base64Image, "base64");
      const result = await this.detectObjects(tempImagePath);
      return result;
    } finally {
      if (fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
      }
    }
  }
  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model_path: this.modelPath,
      model_type: "YOLOv8",
      classes: [
        "thermometer (Lo error)",
        "thermometer (measuring)",
        "thermometer (no display found)",
        "thermometer (off)",
        "thermometer button",
        "thermometer in ear",
        "thermometer in mouth",
        "thermometer in nose",
        "thermometer on face"
      ]
    };
  }
  /**
   * Health check for the CV service
   */
  async healthCheck() {
    try {
      if (this.modelPath.includes("/") && !this.modelPath.includes("cv_model")) {
        console.log("Hugging Face model detected, skipping local file check");
        if (!fs.existsSync(this.pythonScript)) {
          console.warn("Python script not found at:", this.pythonScript);
          return false;
        }
        return true;
      }
      if (!fs.existsSync(this.modelPath)) {
        console.warn("Model file not found at:", this.modelPath);
        return false;
      }
      if (!fs.existsSync(this.pythonScript)) {
        console.warn("Python script not found at:", this.pythonScript);
        return false;
      }
      return true;
    } catch (error) {
      console.error("CV service health check failed:", error);
      return false;
    }
  }
};
var cvService = new CVService();

// server/cv-service-hf.ts
import fetch2 from "node-fetch";
var CVServiceHF = class {
  apiUrl;
  constructor() {
    this.apiUrl = process.env.HF_SPACES_URL || "https://your-username-simisai1-0.hf.space";
    console.log("CV Service HF initialized with:");
    console.log(`- API URL: ${this.apiUrl}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }
  /**
   * Process base64 image data using Hugging Face Spaces API
   */
  async detectObjectsFromBase64(base64Data) {
    try {
      console.log("Calling Hugging Face Spaces API...");
      const headers = {
        "Content-Type": "application/json"
      };
      if (process.env.HUGGINGFACE_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.HUGGINGFACE_TOKEN}`;
      }
      const response = await fetch2(`${this.apiUrl}/run/predict`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: [base64Data]
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const apiResult = result.data[0];
      console.log("HF API response received:", {
        detections: apiResult.detections?.length || 0,
        processing_time: apiResult.processing_time
      });
      return {
        detections: apiResult.detections || [],
        processing_time: apiResult.processing_time || 0,
        image_size: apiResult.image_size || [0, 0]
      };
    } catch (error) {
      console.error("HF API error:", error);
      throw new Error(`Failed to call Hugging Face API: ${error}`);
    }
  }
  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model_path: this.apiUrl,
      model_type: "YOLOv8 (Hugging Face Spaces)",
      classes: [
        "thermometer (Lo error)",
        "thermometer (measuring)",
        "thermometer (no display found)",
        "thermometer (off)",
        "thermometer button",
        "thermometer in ear",
        "thermometer in mouth",
        "thermometer in nose",
        "thermometer on face"
      ]
    };
  }
  /**
   * Health check for the CV service
   */
  async healthCheck() {
    try {
      const headers = {
        "Content-Type": "application/json"
      };
      if (process.env.HUGGINGFACE_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.HUGGINGFACE_TOKEN}`;
      }
      const response = await fetch2(`${this.apiUrl}/run/predict`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          data: [""]
          // Empty base64 data for health check
        })
      });
      return response.ok;
    } catch (error) {
      console.error("HF API health check failed:", error);
      return false;
    }
  }
};
var cvServiceHF = new CVServiceHF();

// server/cv-service-remote.ts
import fetch3 from "node-fetch";
var CVServiceRemote = class {
  apiBaseUrl;
  constructor() {
    this.apiBaseUrl = (process.env.CV_REMOTE_URL || "").replace(/\/$/, "");
    if (!this.apiBaseUrl) {
      console.warn("CVServiceRemote initialized without CV_REMOTE_URL");
    }
    console.log("CV Service Remote initialized with:");
    console.log(`- API URL: ${this.apiBaseUrl || "NOT SET"}`);
    console.log(`- Environment: ${process.env.NODE_ENV}`);
  }
  async detectObjectsFromBase64(base64Data) {
    if (!this.apiBaseUrl) {
      throw new Error("CV_REMOTE_URL is not configured");
    }
    const url = `${this.apiBaseUrl}/predict`;
    const headers = {
      "Content-Type": "application/json"
    };
    const body = JSON.stringify({
      // Provide common field names to maximize compatibility
      imageData: base64Data,
      image_data: base64Data,
      data: [base64Data]
    });
    const response = await fetch3(url, { method: "POST", headers, body });
    if (!response.ok) {
      const text2 = await response.text().catch(() => "");
      throw new Error(`Remote CV error ${response.status}: ${text2}`);
    }
    const result = await response.json();
    const detections = result.detections || result.data?.[0]?.detections || [];
    const processing_time = result.processing_time || result.data?.[0]?.processing_time || 0;
    const image_size = result.image_size || result.data?.[0]?.image_size || [0, 0];
    return { detections, processing_time, image_size };
  }
  getModelInfo() {
    return {
      model_path: this.apiBaseUrl,
      model_type: "YOLOv8 (Remote Microservice)",
      classes: [
        "thermometer (Lo error)",
        "thermometer (measuring)",
        "thermometer (no display found)",
        "thermometer (off)",
        "thermometer button",
        "thermometer in ear",
        "thermometer in mouth",
        "thermometer in nose",
        "thermometer on face"
      ]
    };
  }
  async healthCheck() {
    if (!this.apiBaseUrl) return false;
    try {
      const url = `${this.apiBaseUrl}/health`;
      const res = await fetch3(url, { method: "GET" });
      if (res.ok) return true;
      const ping = await fetch3(`${this.apiBaseUrl}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageData: "" })
      });
      return ping.ok;
    } catch {
      return false;
    }
  }
};
var cvServiceRemote = new CVServiceRemote();

// server/routes.ts
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const cvMode = process.env.CV_REMOTE_URL ? `remote (${process.env.CV_REMOTE_URL})` : process.env.HF_SPACES_URL ? `hf (${process.env.HF_SPACES_URL})` : "local";
  console.log(`[CV] Selected backend: ${cvMode}`);
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/chat-ws",
    // Add error handling for WebSocket server
    handleProtocols: () => "chat-protocol"
  });
  wss.on("error", (error) => {
    console.error("WebSocket server error:", error);
    if (error.code === "ENOTSUP") {
      console.log("WebSocket server binding issue detected, continuing with HTTP server...");
    }
  });
  wss.on("connection", (ws) => {
    console.log("Client connected to chat");
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === "chat_message") {
          const userMessage = await storage.createChatMessage({
            sessionId: message.sessionId,
            message: message.content,
            isUser: true,
            language: message.language || "en"
          });
          wss.clients.forEach((client) => {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify({
                type: "chat_message",
                message: userMessage
              }));
            }
          });
          const aiResponse = await generateSealionResponse({
            sessionId: message.sessionId,
            userMessage: message.content,
            language: message.language || "en"
          });
          const aiMessage = await storage.createChatMessage({
            sessionId: message.sessionId,
            message: aiResponse,
            isUser: false,
            language: message.language || "en"
          });
          setTimeout(() => {
            wss.clients.forEach((client) => {
              if (client.readyState === client.OPEN) {
                client.send(JSON.stringify({
                  type: "chat_message",
                  message: aiMessage
                }));
              }
            });
          }, 1e3);
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      console.log("Client disconnected from chat");
    });
    ws.on("error", (error) => {
      console.error("WebSocket client error:", error);
    });
  });
  app2.post("/api/chat/ask", async (req, res) => {
    try {
      const { sessionId, question, language = "en", deviceHint } = req.body || {};
      const sid = sessionId || "default";
      const savedUser = await storage.createChatMessage({
        sessionId: sid,
        message: String(question || ""),
        isUser: true,
        language
      });
      let extraContext = "";
      if (deviceHint && typeof deviceHint === "object") {
        const parts = [];
        if (deviceHint.type) parts.push(`Detected device type: ${deviceHint.type}`);
        if (deviceHint.label) parts.push(`Label: ${deviceHint.label}`);
        if (deviceHint.confidence) parts.push(`Confidence: ${deviceHint.confidence}`);
        if (parts.length) extraContext = parts.join("\n");
      }
      const answer = await generateSealionResponse({
        sessionId: sid,
        userMessage: savedUser.message,
        language,
        extraContext
      });
      const savedAi = await storage.createChatMessage({
        sessionId: sid,
        message: answer,
        isUser: false,
        language
      });
      res.json({ ok: true, message: savedAi });
    } catch (err) {
      console.error("[chat] /api/chat/ask failed:", err);
      res.status(500).json({ ok: false, error: "Chat failed" });
    }
  });
  app2.get("/api/debug/sealion", async (_req, res) => {
    const configured = Boolean(process.env.SEALION_API_KEY && (process.env.SEALION_API_URL || process.env.OPENAI_BASE_URL));
    const details = {
      configured,
      apiBaseUrl: process.env.SEALION_API_URL || process.env.OPENAI_BASE_URL ? "present" : "missing",
      model: process.env.SEALION_MODEL || "sealion-v3.5-8b-instruct",
      env: process.env.NODE_ENV
    };
    res.json(details);
  });
  app2.get("/api/devices", async (req, res) => {
    try {
      const devices2 = await storage.getDevices();
      res.json(devices2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });
  app2.get("/api/devices/:id", async (req, res) => {
    try {
      const device = await storage.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      res.json(device);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch device" });
    }
  });
  app2.get("/api/devices/:id/instructions", async (req, res) => {
    try {
      const instructions2 = await storage.getInstructionsByDevice(req.params.id);
      res.json(instructions2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instructions" });
    }
  });
  app2.get("/api/devices/:id/instructions/:step", async (req, res) => {
    try {
      const step = parseInt(req.params.step);
      const instruction = await storage.getInstruction(req.params.id, step);
      if (!instruction) {
        return res.status(404).json({ error: "Instruction not found" });
      }
      res.json(instruction);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch instruction" });
    }
  });
  app2.post("/api/guidance-sessions", async (req, res) => {
    try {
      const sessionData = insertGuidanceSessionSchema.parse(req.body);
      const session = await storage.createGuidanceSession(sessionData);
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid session data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create guidance session" });
    }
  });
  app2.get("/api/guidance-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getGuidanceSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });
  app2.patch("/api/guidance-sessions/:id", async (req, res) => {
    try {
      const updates = req.body;
      const session = await storage.updateGuidanceSession(req.params.id, updates);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });
  app2.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });
  app2.post("/api/cv/detect", async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Image data is required" });
      }
      console.log("CV detection request received");
      console.log("Image data length:", imageData.length);
      const service = process.env.CV_REMOTE_URL ? cvServiceRemote : process.env.HF_SPACES_URL ? cvServiceHF : cvService;
      console.log("[CV] detect using:", process.env.CV_REMOTE_URL ? "remote" : process.env.HF_SPACES_URL ? "hf" : "local");
      const result = await service.detectObjectsFromBase64(imageData);
      console.log("CV detection completed");
      console.log("Detections found:", result.detections.length);
      res.json(result);
    } catch (error) {
      console.error("CV detection error:", error);
      res.status(500).json({
        error: "Failed to process image",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : void 0
      });
    }
  });
  app2.get("/api/cv/health", async (req, res) => {
    try {
      console.log("CV health check requested");
      const service = process.env.CV_REMOTE_URL ? cvServiceRemote : process.env.HF_SPACES_URL ? cvServiceHF : cvService;
      console.log("[CV] health using:", process.env.CV_REMOTE_URL ? "remote" : process.env.HF_SPACES_URL ? "hf" : "local");
      const isHealthy = await service.healthCheck();
      const modelInfo = service.getModelInfo?.() ?? { model_type: "unknown" };
      console.log("CV health check result:", { isHealthy, modelInfo });
      res.json({
        healthy: isHealthy,
        model_info: modelInfo,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          CV_REMOTE_URL: process.env.CV_REMOTE_URL ? "SET" : "NOT_SET",
          HF_SPACES_URL: process.env.HF_SPACES_URL ? "SET" : "NOT_SET",
          CV_MODEL_PATH: process.env.CV_MODEL_PATH,
          HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN ? "SET" : "NOT_SET"
        }
      });
    } catch (error) {
      console.error("CV health check error:", error);
      res.status(500).json({
        error: "CV service health check failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/cv/stream", async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Image data is required" });
      }
      const service = process.env.CV_REMOTE_URL ? cvServiceRemote : process.env.HF_SPACES_URL ? cvServiceHF : cvService;
      console.log("[CV] stream using:", process.env.CV_REMOTE_URL ? "remote" : process.env.HF_SPACES_URL ? "hf" : "local");
      const result = await service.detectObjectsFromBase64(imageData);
      res.json(result);
    } catch (error) {
      console.error("CV stream error:", error);
      res.status(500).json({
        error: "Failed to process stream",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  return httpServer;
}
async function generateSealionResponse(args) {
  const { sessionId, userMessage, language, extraContext } = args;
  const apiKey = process.env.SEALION_API_KEY;
  const apiBaseUrl = process.env.SEALION_API_URL || process.env.OPENAI_BASE_URL;
  const model = process.env.SEALION_MODEL || "sealion-v3.5-8b-instruct";
  if (!apiKey || !apiBaseUrl) {
    console.log("[chat] Sealion not configured. Using fallback.");
    return generateFallbackResponse(userMessage, language);
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2e4);
    const history = (await storage.getChatMessages(sessionId)).slice(-8);
    let deviceContext = "";
    try {
      const session = await storage.getGuidanceSession(sessionId);
      if (session?.deviceId) {
        const steps = await storage.getInstructionsByDevice(session.deviceId);
        const current = session.currentStep ?? 1;
        const nearby = steps.filter((s) => Math.abs(s.stepNumber - current) <= 2).map((s) => `Step ${s.stepNumber}: ${s.title} \u2014 ${s.description}`).join("\n");
        if (nearby) deviceContext = `Relevant device steps (around current step ${current}):
${nearby}`;
      }
    } catch {
    }
    const messages = [
      {
        role: "system",
        content: [
          "You are SIMIS, a multilingual medical device assistant.",
          `- Answer strictly in the user's language (ISO code: ${language}). Do not switch languages.`,
          "- Explain step-by-step, short and clear.",
          "- If safety-critical, recommend checking the device manual and consulting a clinician.",
          "- Keep responses under 120 words.",
          deviceContext ? `
${deviceContext}` : "",
          extraContext ? `
${extraContext}` : ""
        ].filter(Boolean).join("\n")
      },
      ...history.map((m) => ({ role: m.isUser ? "user" : "assistant", content: m.message })),
      { role: "user", content: userMessage }
    ];
    const endpoint = `${apiBaseUrl.replace(/\/$/, "")}/v1/chat/completions`;
    console.log("[chat] Calling Sealion:", { endpoint, model });
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 400,
        chat_template_kwargs: {
          thinking_mode: "off"
        },
        cache: {
          "no-cache": true
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const text2 = await res.text().catch(() => "");
      console.error("[chat] Sealion API error:", res.status, text2);
      return generateFallbackResponse(userMessage, language);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    console.log("[chat] Sealion success");
    return content || generateFallbackResponse(userMessage, language);
  } catch (error) {
    console.error("[chat] Sealion API request failed:", error);
    return generateFallbackResponse(userMessage, language);
  }
}
function generateFallbackResponse(userMessage, language) {
  const responses = {
    en: {
      cuff: "The cuff should be snug, not tight. You should be able to slide one finger under it.",
      tight: "If it feels too tight, loosen slightly. It must be secure without restricting blood flow.",
      position: "Position the cuff ~1 inch above the elbow with the tube pointing down your arm.",
      default: "I can help with your device. What step are you on, or what seems unclear?"
    },
    id: {
      cuff: "Manset harus pas, tidak terlalu ketat. Harus bisa menyelipkan satu jari di bawahnya.",
      tight: "Jika terlalu ketat, longgarkan sedikit. Harus aman tanpa menghambat aliran darah.",
      position: "Posisikan manset ~1 inci di atas siku dengan selang mengarah ke bawah lengan.",
      default: "Saya dapat membantu. Anda berada di langkah berapa atau bagian mana yang kurang jelas?"
    },
    th: {
      cuff: "\u0E02\u0E49\u0E2D\u0E21\u0E37\u0E2D\u0E04\u0E27\u0E23\u0E1E\u0E2D\u0E14\u0E35 \u0E44\u0E21\u0E48\u0E41\u0E19\u0E48\u0E19\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B \u0E04\u0E27\u0E23\u0E2A\u0E2D\u0E14\u0E19\u0E34\u0E49\u0E27\u0E40\u0E02\u0E49\u0E32\u0E44\u0E1B\u0E44\u0E14\u0E49\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E19\u0E34\u0E49\u0E27",
      tight: "\u0E2B\u0E32\u0E01\u0E41\u0E19\u0E48\u0E19\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B \u0E43\u0E2B\u0E49\u0E04\u0E25\u0E32\u0E22\u0E40\u0E25\u0E47\u0E01\u0E19\u0E49\u0E2D\u0E22 \u0E04\u0E27\u0E23\u0E21\u0E31\u0E48\u0E19\u0E04\u0E07\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E23\u0E1A\u0E01\u0E27\u0E19\u0E01\u0E32\u0E23\u0E44\u0E2B\u0E25\u0E40\u0E27\u0E35\u0E22\u0E19\u0E40\u0E25\u0E37\u0E2D\u0E14",
      position: "\u0E27\u0E32\u0E07\u0E02\u0E49\u0E2D\u0E21\u0E37\u0E2D\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 1 \u0E19\u0E34\u0E49\u0E27\u0E40\u0E2B\u0E19\u0E37\u0E2D\u0E02\u0E49\u0E2D\u0E28\u0E2D\u0E01 \u0E42\u0E14\u0E22\u0E43\u0E2B\u0E49\u0E17\u0E48\u0E2D\u0E2B\u0E31\u0E19\u0E25\u0E07\u0E15\u0E32\u0E21\u0E41\u0E02\u0E19",
      default: "\u0E09\u0E31\u0E19\u0E0A\u0E48\u0E27\u0E22\u0E44\u0E14\u0E49 \u0E04\u0E38\u0E13\u0E2D\u0E22\u0E39\u0E48\u0E02\u0E31\u0E49\u0E19\u0E15\u0E2D\u0E19\u0E44\u0E2B\u0E19 \u0E2B\u0E23\u0E37\u0E2D\u0E2A\u0E48\u0E27\u0E19\u0E44\u0E2B\u0E19\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E0A\u0E31\u0E14\u0E40\u0E08\u0E19?"
    },
    vi: {
      cuff: "V\xF2ng b\xEDt ph\u1EA3i v\u1EEBa kh\xEDt, kh\xF4ng qu\xE1 ch\u1EB7t. C\xF3 th\u1EC3 lu\u1ED3n m\u1ED9t ng\xF3n tay v\xE0o b\xEAn d\u01B0\u1EDBi.",
      tight: "N\u1EBFu qu\xE1 ch\u1EB7t, h\xE3y n\u1EDBi l\u1ECFng m\u1ED9t ch\xFAt. Ph\u1EA3i ch\u1EAFc nh\u01B0ng kh\xF4ng c\u1EA3n tr\u1EDF m\xE1u l\u01B0u th\xF4ng.",
      position: "\u0110\u1EB7t v\xF2ng b\xEDt c\xE1ch khu\u1EF7u tay ~1 inch, \u1ED1ng h\u01B0\u1EDBng xu\u1ED1ng c\xE1nh tay.",
      default: "T\xF4i c\xF3 th\u1EC3 gi\xFAp. B\u1EA1n \u0111ang \u1EDF b\u01B0\u1EDBc n\xE0o, ho\u1EB7c ph\u1EA7n n\xE0o ch\u01B0a r\xF5?"
    },
    fil: {
      cuff: "Ang cuff ay dapat sakto lang, hindi masyadong mahigpit. Dapat maisuot ang isang daliri sa ilalim.",
      tight: "Kung masyadong mahigpit, luwagan nang bahagya. Dapat ligtas ngunit hindi humahadlang sa daloy ng dugo.",
      position: "Iposisyon ang cuff ~1 pulgada sa itaas ng siko, ang tubo ay pababa sa braso.",
      default: "Makakatulong ako. Nasa anong hakbang ka o anong bahagi ang hindi malinaw?"
    }
  };
  const lang = responses[language] || responses.en;
  const text2 = userMessage.toLowerCase();
  if (text2.includes("cuff") || text2.includes("manset")) return lang.cuff;
  if (text2.includes("tight") || text2.includes("ketat")) return lang.tight;
  if (text2.includes("position") || text2.includes("posisi")) return lang.position;
  return lang.default;
}

// server/static.ts
import express from "express";
import fs2 from "fs";
import path2 from "path";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.get("/how-it-works", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "how-it-works", "index.html"));
  });
  app2.get("/how-it-works/", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "how-it-works", "index.html"));
  });
  app2.get("/welcome-static", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "welcome-static", "index.html"));
  });
  app2.get("/welcome-static/", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "welcome-static", "index.html"));
  });
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import dotenv2 from "dotenv";
dotenv2.config();
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });
    if (app.get("env") !== "development") {
      serveStatic(app);
    }
    const port = parseInt(process.env.PORT || "3001", 10);
    const host = process.env.NODE_ENV === "development" ? "0.0.0.0" : "0.0.0.0";
    server.listen({
      port,
      host,
      reusePort: true
    }, () => {
      log(`\u2705 Server running on ${host}:${port}`);
      if (process.env.NODE_ENV === "development") {
        log(`\u{1F310} Local development server accessible at http://localhost:${port}`);
        log(`\u{1F527} API endpoints available at http://localhost:${port}/api`);
        log(`\u{1F4AC} WebSocket available at ws://localhost:${port}/chat-ws`);
      }
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        log(`\u274C Port ${port} is already in use. Please try a different port.`);
      } else if (err.code === "ENOTSUP") {
        log(`\u274C Socket operation not supported. Trying alternative configuration...`);
        server.listen({
          port,
          host,
          reusePort: false
        }, () => {
          log(`\u2705 Server running on ${host}:${port} (without reusePort)`);
        });
      } else {
        log(`\u274C Server error: ${err.message}`);
      }
    });
  } catch (error) {
    log(`\u274C Failed to start server: ${error instanceof Error ? error.message : "Unknown error"}`);
    process.exit(1);
  }
})();
