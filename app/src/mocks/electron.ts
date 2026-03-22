// Mock electron module for browser environment
export const shell = {
  openExternal: (url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank')
    }
  },
}

export const ipcRenderer = {
  on: () => {},
  send: () => {},
  removeListener: () => {},
}

export const ipcMain = {
  on: () => {},
  handle: () => {},
  removeHandler: () => {},
}

export default {
  shell,
  ipcRenderer,
  ipcMain,
}
