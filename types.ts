
export interface SecurityAlert {
  alert: string;
  location: string;
  user_current_location: string;
  attempts: number;
  timestamp: string;
  id: string;
}

export interface SecurityAction {
  id: string;
  type: 'LOCK' | 'ROTATE' | 'VOICE_CALL' | 'ANALYSIS';
  status: 'PENDING' | 'EXECUTED' | 'FAILED' | 'CONSULTING';
  details: string;
  timestamp: string;
}

export interface AIReasoning {
  threatProbability: number;
  reasoning: string;
  suggestedAction: string;
  voiceScript?: string;
}

export enum SecurityLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}
