export interface Protocol {
  protocol_name: string;
  exposure: number;
  risk_level: string;
  protocol_id: string;
}

export interface Portfolio {
  total_value: number;
  protocols: Protocol[];
  chains: string[];
  main_strategies: string[];
} 