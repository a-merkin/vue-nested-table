<template>
  <div class="gantt-bar-container">
    <div class="gantt-bar"
         :class="[
           getEventKindClass(kind),
           getEventTypeClass(type),
           `${styleType}-bar`
         ].filter(Boolean)"
         :style="calculateBarStyle()"
         :title="item.name">
      <div class="gantt-bar-label">{{ item.name }}</div>
      <template v-if="styleType === 'resource' && item.operations">
        <div v-for="operation in item.operations"
             :key="operation.id"
             class="inner-operation"
             :style="calculateInnerOperationStyle(operation)"
             :title="operation.name">
          <span class="inner-operation-label">{{ operation.name }}</span>
        </div>
      </template>
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

type Operation = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type Item = {
  name: string;
  startDate: string | null;
  endDate: string | null;
  operations?: Operation[];
};

const props = defineProps<{
  item: Item;
  groupedDates: DateRange[];
  kind?: EventKind;
  type: EventType;
  styleType: 'event' | 'resource' | 'operation';
}>();

const calculateBarStyle = () => {
  if (!props.item.startDate || !props.item.endDate) {
    return {
      display: 'none'
    };
  }

  const start = new Date(props.item.startDate);
  const end = new Date(props.item.endDate);

  const timelineStart = new Date(props.groupedDates[0].start);
  const timelineEnd = new Date(props.groupedDates[props.groupedDates.length - 1].end);

  const timelineDuration = timelineEnd.getTime() - timelineStart.getTime();
  const startOffset = Math.max(0, ((start.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const endOffset = Math.min(100, ((end.getTime() - timelineStart.getTime()) / timelineDuration) * 100);
  const width = Math.max(0, endOffset - startOffset);

  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 5)}%`,
    minWidth: '20px'
  };
};

const calculateInnerOperationStyle = (operation: Operation) => {
  const start = new Date(operation.startDate);
  const end = new Date(operation.endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  const resourceStart = new Date(props.item.startDate || '');
  const resourceEnd = new Date(props.item.endDate || '');

  resourceStart.setHours(0, 0, 0, 0);
  resourceEnd.setHours(23, 59, 59, 999);

  const resourceDuration = resourceEnd.getTime() - resourceStart.getTime();
  const startOffset = Math.max(0, ((start.getTime() - resourceStart.getTime()) / resourceDuration) * 100);
  const width = Math.min(100 - startOffset, ((end.getTime() - start.getTime()) / resourceDuration) * 100);

  return {
    left: `${startOffset}%`,
    width: `${Math.max(width, 2)}%`
  };
};

const getEventKindClass = (kind?: EventKind): string =>
  kind ? `event-kind-${kind.replace('event_kind_', '')}` : '';
const getEventTypeClass = (type: EventType): string => `event-type-${type.replace('event_type_', '')}`;
</script>

<style scoped>
.gantt-bar-container {
  height: 60px;
  position: relative;
  margin: 4px 0;
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
  top: 50%;
  transform: translateY(-50%);
}

.gantt-bar:hover {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transform: translateY(calc(-50% - 1px));
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
  height: 40px;
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
  height: 50px;
  border-width: 1px;
  border-style: solid;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5));
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.resource-bar .gantt-bar-label {
  font-size: 11px;
  font-weight: 500;
  color: #333333;
  padding: 6px 8px;
  height: 20px;
  display: flex;
  align-items: center;
}

/* Операции - нижний уровень */
.operation-bar {
  height: 30px;
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

/* Стили для внутренних операций */
.inner-operation {
  position: absolute;
  height: 16px;
  bottom: 4px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 2px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  overflow: hidden;
  min-width: 20px;
  max-width: 100%;
}

.inner-operation:hover {
  background: rgba(255, 255, 255, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.inner-operation-label {
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
  color: #333;
  user-select: none;
  width: 100%;
  min-width: 0;
}
</style>
