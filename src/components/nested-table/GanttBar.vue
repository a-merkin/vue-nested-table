<template>
  <div class="gantt-bar-container">
    <div class="gantt-bar"
         :class="[
           getEventKindClass(kind),
           getEventTypeClass(type),
           `${styleType}-bar`
         ]"
         :style="calculateBarStyle()"
         :title="item.name">
      <div class="gantt-bar-label">{{ item.name }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EventKind, EventType } from '../../types/table';

type DateRange = {
  start: Date;
  end: Date;
  key: string;
};

type Item = {
  name: string;
  startDate: string;
  endDate: string;
};

const props = defineProps<{
  item: Item;
  groupedDates: DateRange[];
  kind: EventKind;
  type: EventType;
  styleType: 'event' | 'resource' | 'operation';
}>();

const calculateBarStyle = () => {
  const start = new Date(props.item.startDate);
  const end = new Date(props.item.endDate);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  
  const timelineStart = new Date(props.groupedDates[0].start);
  const timelineEnd = new Date(props.groupedDates[props.groupedDates.length - 1].end);
  
  timelineStart.setHours(0, 0, 0, 0);
  
  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((start.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.min(100 - startOffset, ((end.getTime() - start.getTime()) / timelineDuration) * 100);
  
  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 5)}%`,
    minWidth: '20px'
  };
};

const getEventKindClass = (kind: EventKind): string => `event-kind-${kind.replace('event_kind_', '')}`;
const getEventTypeClass = (type: EventType): string => `event-type-${type.replace('event_type_', '')}`;
</script>

<style scoped>
.gantt-bar-container {
  height: 30px;
  position: relative;
  margin: 2px 0;
  width: 100%;
  padding: 0 2px;
  box-sizing: border-box;
}

.gantt-bar {
  position: absolute;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  z-index: 1;
}

.gantt-bar:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.gantt-bar-label {
  padding: 4px 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  left: 4px;
  max-width: calc(100% - 8px);
}

/* События - самый высокий уровень */
.event-bar {
  height: 28px;
  top: 1px;
  border-width: 2px;
  border-style: solid;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  font-weight: 600;
}

.event-bar .gantt-bar-label {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
}

/* Ресурсы - средний уровень */
.resource-bar {
  height: 24px;
  top: 3px;
  border-width: 1px;
  border-style: solid;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5));
}

.resource-bar .gantt-bar-label {
  font-size: 11px;
  font-weight: 500;
  color: #333333;
}

/* Операции - нижний уровень */
.operation-bar {
  height: 20px;
  top: 5px;
  border-width: 1px;
  border-style: dashed;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
}

.operation-bar .gantt-bar-label {
  font-size: 10px;
  font-weight: 400;
  color: #666666;
}

/* Цвета для видов мероприятий */
.event-kind-gtm {
  background: linear-gradient(to right, rgba(227, 242, 253, 0.9), rgba(227, 242, 253, 0.7));
  border-color: #1976d2;
}

.event-kind-otm {
  background: linear-gradient(to right, rgba(243, 229, 245, 0.9), rgba(243, 229, 245, 0.7));
  border-color: #7b1fa2;
}

.event-kind-start {
  background: linear-gradient(to right, rgba(232, 245, 233, 0.9), rgba(232, 245, 233, 0.7));
  border-color: #388e3c;
}

.event-kind-shut {
  background: linear-gradient(to right, rgba(255, 235, 238, 0.9), rgba(255, 235, 238, 0.7));
  border-color: #d32f2f;
}

/* Цвета для типов мероприятий */
.event-type-grp { border-right: 3px solid #1976d2; }
.event-type-opz { border-right: 3px solid #2196f3; }
.event-type-zbs { border-right: 3px solid #64b5f6; }
.event-type-vns { border-right: 3px solid #90caf9; }

.event-type-krs { border-right: 3px solid #7b1fa2; }
.event-type-trs { border-right: 3px solid #9c27b0; }
.event-type-ppr { border-right: 3px solid #ba68c8; }

.event-type-start { border-right: 3px solid #388e3c; }

.event-type-conservation { border-right: 3px solid #d32f2f; }
.event-type-liquidation { border-right: 3px solid #f44336; }
</style> 