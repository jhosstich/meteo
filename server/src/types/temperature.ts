export type TemperatureYaml = {
  temperature?: {
    unit?: string;
    values?: TimeValue[];
  }
};

export type TimeValue = {
  time: string;    
  value: number;
  hsmtoSec: number;
};

export type TemperatureValues = {
  unit: string;
  values: TimeValue[];
};