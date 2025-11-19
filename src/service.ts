// src/service.ts
import BackgroundService from 'react-native-background-actions';
import {Platform, DeviceEventEmitter} from 'react-native';

let isRunning = false;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const task = async (taskData: any) => {
  const {delay} = taskData;

  while (BackgroundService.isRunning()) {
    console.log('BACKGROUND TICK:', new Date().toLocaleTimeString());
    await sleep(delay);
  }
};

const options = {
  taskName: 'Logger',
  taskTitle: 'Say "stop" to end',
  taskDesc: 'Voice + Background Active',
  taskIcon: {
    name: 'notification_icon',
    type: 'drawable',
  },
  color: '#00ff00',
  parameters: {delay: 5000},
};

export const startBackground = async () => {
  if (Platform.OS !== 'android') return false;
  if (isRunning || BackgroundService.isRunning()) return true;

  try {
    await BackgroundService.start(task, options);
    isRunning = true;
    console.log('Background service STARTED');
    return true;
  } catch (e: any) {
    console.error('START ERROR:', e);
    return false;
  }
};

export const stopBackground = async () => {
  if (!isRunning && !BackgroundService.isRunning()) return;

  try {
    await BackgroundService.stop();
    isRunning = false;
    console.log('Background service STOPPED');
  } catch (e) {
    console.error('STOP ERROR:', e);
  }
};

// Listen for voice command from UI
DeviceEventEmitter.addListener('StopBackground', () => {
  console.log('VOICE COMMAND: Stopping background...');
  stopBackground();
});
