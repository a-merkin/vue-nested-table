export type EventKind =
  | 'event_kind_gtm'
  | 'event_kind_otm'
  | 'event_kind_start'
  | 'event_kind_shut';

export type EventType =
  | 'base_production'
  // ГТМ
  | 'event_type_grp'
  | 'event_type_opz'
  | 'event_type_zbs'
  | 'event_type_vns'
  // ОТМ
  | 'event_type_krs'
  | 'event_type_trs'
  | 'event_type_ppr'
  // Запуски
  | 'event_type_start'
  // Отключения
  | 'event_type_conservation'
  | 'event_type_liquidation';

export type OperatingState =
  | 'operating_state_prod'
  | 'operating_state_inje'
  | 'operating_state_idle'
  | 'operating_state_intake';

export type DateGranularity =
  | 'day'
  | 'week'
  | 'month';

export interface Operation {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Resource {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  operations: Operation[];
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  kind?: EventKind;
  startDate: string | null;
  endDate: string | null;
  resources?: Resource[];
  operating_states?: { state: OperatingState; startDate: string; endDate: string; }[];
}

export interface Well {
  id: string;
  name: string;
  state: OperatingState;
  events: Event[];
}

export interface OperatingStateEntry {
  state: OperatingState;
  startDate: string;
  endDate: string;
}

export function validateOperatingStates(states: OperatingStateEntry[]): boolean {
  if (states.length === 0) return true;

  // Сортируем состояния по дате начала
  const sortedStates = [...states].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Проверяем, что каждое следующее состояние начинается в день окончания предыдущего
  for (let i = 0; i < sortedStates.length - 1; i++) {
    const currentEnd = new Date(sortedStates[i].endDate);
    const nextStart = new Date(sortedStates[i + 1].startDate);

    // Устанавливаем время в начало дня для корректного сравнения
    currentEnd.setHours(0, 0, 0, 0);
    nextStart.setHours(0, 0, 0, 0);

    if (currentEnd.getTime() !== nextStart.getTime()) {
      return false;
    }
  }

  return true;
}
