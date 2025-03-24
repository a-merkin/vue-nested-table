export interface Operation {
  id: string;
  name: string;
  startDate: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  operations: Operation[];
}

export interface Event {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  resources: Resource[];
}

export interface Well {
  id: string;
  name: string;
  state: string;
  events: Event[];
} 