import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

let navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

// Einfacher Event-Emitter für React Native
type Callback = (time: string) => void;
const listeners: Callback[] = [];

export const NavigationEvents = {
  TIME_SELECTED: 'TIME_SELECTED',
};

export function setNavigationRef(ref: NavigationContainerRef<RootStackParamList>) {
  navigationRef = ref;
}

export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef) {
    navigationRef.dispatch(CommonActions.navigate({ name, params }));
  }
}

export function goBack() {
  if (navigationRef) {
    navigationRef.dispatch(CommonActions.goBack());
  }
}

export const emitTimeSelected = (time: string) => {
  listeners.forEach(callback => callback(time));
};

export const onTimeSelected = (callback: (time: string) => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}; 