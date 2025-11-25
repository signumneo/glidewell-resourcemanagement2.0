import { AuthService } from './authService';

interface ProcessDefinition {
  PartNumber: string;
  Version: string;
  Description: string;
  Quantity: string;
}

interface ProcessStep {
  Description: string;
  Value: string;
  Units: string;
  Quantity: number;
  Control: string;
}

interface ProcessDetail {
  ProcessId: number;
  OperatorId: number;
  TimeStamp: string;
  NumberOfData: number;
  Description: string;
  Data: ProcessStep[];
}

export class IoTService {
  private baseUrl: string;
  private authService: AuthService;

  constructor(baseUrl: string, authService: AuthService) {
    this.baseUrl = baseUrl;
    this.authService = authService;
  }

  async fetchProcessDefinitions(): Promise<{ Header: unknown; Data: ProcessDefinition[] }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No auth token');

    const payload = {
      Header: {
        SenderId: "",
        ClientId: "",
        Location: "",
        MessageType: "Cmd",
        MessageId: `process_${Date.now()}`,
        TimeStamp: new Date().toISOString(),
        MessageVersion: "10.0.0",
        DataEncoding: "Json",
        Feedback: true,
        ResponseTopic: "",
        Control: "IoT,View"
      },
      Data: {}
    };

    const response = await fetch(`${this.baseUrl}/api`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`IoT,View failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async fetchProcessSteps(partNumber: number, routerId: number = 1): Promise<{ Header: unknown; Data: Record<string, unknown> }> {
    const token = this.authService.getToken();
    if (!token) throw new Error('No auth token');

    const payload = {
      Header: {
        SenderId: "",
        ClientId: "",
        Location: "",
        MessageType: "Cmd",
        MessageId: `review_${Date.now()}`,
        TimeStamp: new Date().toISOString(),
        MessageVersion: "10.0.0",
        DataEncoding: "Json",
        Feedback: true,
        ResponseTopic: "",
        Control: "IoT,Review"
      },
      Data: {
        PartNumber: partNumber,
        RouterId: routerId
      }
    };

    const response = await fetch(`${this.baseUrl}/api`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`IoT,Review failed: ${response.statusText}`);
    }

    return await response.json();
  }

  parseProcessSteps(response: { Data: Record<string, unknown> }): Record<string, ProcessDetail> {
    const metadataKeys = [
      'Description', 'PartNumber', 'ProNo', 'ProRev',
      'DrwNo', 'DrwRev', 'BomNo', 'BomRev', 'RouterId',
      'Quantity', 'OperatorId', 'CurrentProcess',
      'Level', 'Status', 'Version'
    ];

    const processSteps: Record<string, ProcessDetail> = {};

    Object.keys(response.Data).forEach(key => {
      if (!metadataKeys.includes(key) && !isNaN(Number(key))) {
        processSteps[key] = response.Data[key] as ProcessDetail;
      }
    });

    return processSteps;
  }
}
