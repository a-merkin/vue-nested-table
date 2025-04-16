export interface Stage {
    id: string;
    name: string;
    startDate: string;
}

export interface Resource {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    stages: Stage[];
}

export interface OperatingState {
    startDate: string;
    endDate: string;
    state: string | null;
}

export interface Event {
    id: string;
    name: string;
    kind?: string;
    type: string;
    startDate: string | null;
    endDate: string | null;
    resources: Resource[];
    operating_states: OperatingState[];
    stop_well: boolean;
    shut_well: boolean;
}

export interface Well {
    id: string;
    name: string;
    state: string | null;
    events: Event[];
} 