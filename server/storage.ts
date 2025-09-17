import { 
  type Device, 
  type Instruction, 
  type ChatMessage, 
  type GuidanceSession,
  type InsertDevice, 
  type InsertInstruction, 
  type InsertChatMessage, 
  type InsertGuidanceSession 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Devices
  getDevices(): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  
  // Instructions
  getInstructionsByDevice(deviceId: string): Promise<Instruction[]>;
  getInstruction(deviceId: string, stepNumber: number): Promise<Instruction | undefined>;
  createInstruction(instruction: InsertInstruction): Promise<Instruction>;
  
  // Chat Messages
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Guidance Sessions
  getGuidanceSession(id: string): Promise<GuidanceSession | undefined>;
  createGuidanceSession(session: InsertGuidanceSession): Promise<GuidanceSession>;
  updateGuidanceSession(id: string, updates: Partial<GuidanceSession>): Promise<GuidanceSession | undefined>;
}

export class MemStorage implements IStorage {
  private devices: Map<string, Device>;
  private instructions: Map<string, Instruction>;
  private chatMessages: Map<string, ChatMessage>;
  private guidanceSessions: Map<string, GuidanceSession>;

  constructor() {
    this.devices = new Map();
    this.instructions = new Map();
    this.chatMessages = new Map();
    this.guidanceSessions = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample devices
    const bpMonitor: Device = {
      id: randomUUID(),
      name: "Digital BP Monitor",
      type: "bp_monitor",
      stepCount: 5,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Automated blood pressure monitoring device"
    };

    const glucoseMeter: Device = {
      id: randomUUID(),
      name: "Glucose Meter",
      type: "glucose_meter",
      stepCount: 4,
      isActive: true,
      imageUrl: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Blood glucose monitoring device"
    };

    const thermometer: Device = {
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

    // Create sample instructions for BP Monitor
    const bpInstructions: Instruction[] = [
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
            title: "เตรียมอุปกรณ์",
            description: "ตรวจสอบให้แน่ใจว่าเครื่องวัดความดันโลหิตอยู่บนพื้นผิวที่มั่นคงและเสียบปลั๊กหรือมีแบตเตอรี่เพียงพอ"
          },
          "vi": {
            title: "Chuẩn bị thiết bị",
            description: "Đảm bảo máy đo huyết áp được đặt trên bề mặt ổn định và được cắm điện hoặc có đủ pin."
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
            title: "พันข้อมือรอบแขน",
            description: "วางข้อมือรอบต้นแขนของคุณ ประมาณ 1 นิ้วเหนือข้อศอก ข้อมือควรพอดีแต่ไม่แน่นเกินไป"
          },
          "vi": {
            title: "Quấn vòng bít quanh cánh tay",
            description: "Đặt vòng bít quanh cánh tay trên của bạn, cách khuỷu tay khoảng 1 inch. Vòng bít phải vừa khít nhưng không quá chặt."
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

    bpInstructions.forEach(instruction => {
      this.instructions.set(instruction.id, instruction);
    });

    // Create sample instructions for Digital Thermometer
    const thermometerInstructions: Instruction[] = [
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
            title: "เปิดเทอร์โมมิเตอร์และรอสัญญาณพร้อม",
            description: "กดปุ่มเปิดเครื่องเทอร์โมมิเตอร์ดิจิตอลและรอให้หน้าจอแสดงสัญญาณพร้อม (มักจะเป็นเสียงบี๊บหรือไอคอนเฉพาะ)"
          },
          "vi": {
            title: "Bật nhiệt kế và chờ tín hiệu sẵn sàng",
            description: "Nhấn nút nguồn trên nhiệt kế kỹ thuật số và chờ màn hình hiển thị tín hiệu sẵn sàng (thường là tiếng beep hoặc biểu tượng cụ thể)."
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
            title: "วางปลายเทอร์โมมิเตอร์ใต้ลิ้น ด้านข้างปาก",
            description: "วางปลายเทอร์โมมิเตอร์เบาๆ ใต้ลิ้น โดยวางไว้ด้านข้างปากเพื่อการอ่านค่าที่แม่นยำ"
          },
          "vi": {
            title: "Đặt đầu nhiệt kế dưới lưỡi, bên cạnh miệng",
            description: "Nhẹ nhàng đặt đầu nhiệt kế dưới lưỡi, định vị bên cạnh miệng để có kết quả đọc chính xác."
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
            title: "ปิดปากเบาๆ และปิดริมฝีปากให้สนิท",
            description: "ปิดปากเบาๆ รอบเทอร์โมมิเตอร์ ตรวจสอบให้แน่ใจว่าริมฝีปากปิดสนิทเพื่อป้องกันไม่ให้อากาศส่งผลต่อการอ่านค่า"
          },
          "vi": {
            title: "Nhắm miệng nhẹ nhàng và giữ môi khép kín",
            description: "Nhắm miệng nhẹ nhàng xung quanh nhiệt kế, đảm bảo môi khép kín để ngăn không khí ảnh hưởng đến kết quả đọc."
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
            title: "รอให้เทอร์โมมิเตอร์ส่งเสียงบี๊บ (โดยปกติ 30-60 วินาที)",
            description: "ถือเทอร์โมมิเตอร์ไว้ในตำแหน่งเดิมและรอเสียงบี๊บที่บ่งบอกว่าการวัดเสร็จสิ้นแล้ว"
          },
          "vi": {
            title: "Giữ nhiệt kế tại chỗ và chờ tiếng beep cho biết việc đo đã hoàn thành.",
            description: "Giữ nhiệt kế tại chỗ và chờ tiếng beep cho biết việc đo đã hoàn thành."
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
            title: "นำเทอร์โมมิเตอร์ออกและอ่านค่าอุณหภูมิที่แสดง",
            description: "นำเทอร์โมมิเตอร์ออกจากปากอย่างระมัดระวังและอ่านค่าอุณหภูมิที่แสดงบนหน้าจอ"
          },
          "vi": {
            title: "Lấy nhiệt kế ra khỏi miệng và đọc nhiệt độ hiển thị trên màn hình.",
            description: "Lấy nhiệt kế ra khỏi miệng và đọc nhiệt độ hiển thị trên màn hình."
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

    thermometerInstructions.forEach(instruction => {
      this.instructions.set(instruction.id, instruction);
    });
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values()).filter(device => device.isActive);
  }

  async getDevice(id: string): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const id = randomUUID();
    const device: Device = { 
      ...insertDevice, 
      id,
      description: insertDevice.description ?? null,
      isActive: insertDevice.isActive ?? true,
      imageUrl: insertDevice.imageUrl ?? null
    };
    this.devices.set(id, device);
    return device;
  }

  async getInstructionsByDevice(deviceId: string): Promise<Instruction[]> {
    return Array.from(this.instructions.values())
      .filter(instruction => instruction.deviceId === deviceId)
      .sort((a, b) => a.stepNumber - b.stepNumber);
  }

  async getInstruction(deviceId: string, stepNumber: number): Promise<Instruction | undefined> {
    return Array.from(this.instructions.values())
      .find(instruction => instruction.deviceId === deviceId && instruction.stepNumber === stepNumber);
  }

  async createInstruction(insertInstruction: InsertInstruction): Promise<Instruction> {
    const id = randomUUID();
    const instruction: Instruction = { 
      ...insertInstruction, 
      id,
      translations: insertInstruction.translations ?? null,
      audioUrl: insertInstruction.audioUrl ?? null,
      imageUrl: insertInstruction.imageUrl ?? null,
      checkpoints: insertInstruction.checkpoints
        ? Array.from(insertInstruction.checkpoints as string[])
        : null
    };
    this.instructions.set(id, instruction);
    return instruction;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      language: insertMessage.language ?? "en",
      timestamp: new Date().toISOString() 
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getGuidanceSession(id: string): Promise<GuidanceSession | undefined> {
    return this.guidanceSessions.get(id);
  }

  async createGuidanceSession(insertSession: InsertGuidanceSession): Promise<GuidanceSession> {
    const id = randomUUID();
    const session: GuidanceSession = { 
      ...insertSession, 
      id,
      currentStep: insertSession.currentStep ?? 1,
      language: insertSession.language ?? "en",
      completedAt: insertSession.completedAt ?? null,
      isCompleted: insertSession.isCompleted ?? false,
      startedAt: new Date().toISOString() 
    };
    this.guidanceSessions.set(id, session);
    return session;
  }

  async updateGuidanceSession(id: string, updates: Partial<GuidanceSession>): Promise<GuidanceSession | undefined> {
    const session = this.guidanceSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.guidanceSessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
