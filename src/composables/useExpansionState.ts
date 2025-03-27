import { ref } from 'vue';

export const useExpansionState = () => {
  const expandedEvents = ref<Set<string>>(new Set());
  const expandedResources = ref<Set<string>>(new Set());

  const toggleEvent = (eventId: string): void => {
    if (expandedEvents.value.has(eventId)) {
      expandedEvents.value.delete(eventId);
      expandedResources.value.clear();
    } else {
      expandedEvents.value.add(eventId);
    }
  };

  const toggleResource = (resourceId: string): void => {
    if (expandedResources.value.has(resourceId)) {
      expandedResources.value.delete(resourceId);
    } else {
      expandedResources.value.add(resourceId);
    }
  };

  const isEventExpanded = (eventId: string): boolean => expandedEvents.value.has(eventId);
  const isResourceExpanded = (resourceId: string): boolean => expandedResources.value.has(resourceId);

  return {
    expandedEvents,
    expandedResources,
    toggleEvent,
    toggleResource,
    isEventExpanded,
    isResourceExpanded
  };
}; 