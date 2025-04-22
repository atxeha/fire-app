import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  navigate: (page: string) => ipcRenderer.send("navigate", page),
  addEquipment: (data: any) => ipcRenderer.invoke("add-equipment", data),
  getEquipmentList: () => ipcRenderer.invoke("get-equipment-list"),
  pullEquipment: (data: any) => ipcRenderer.invoke("pull-equipment", data),
  returnEquipment: (equipmentLogId: string) => ipcRenderer.invoke('return-equipment',equipmentLogId),
  returnMultipleEquipments: (equipmentLogIds: string[]) => ipcRenderer.invoke("return-multiple-equipment", equipmentLogIds),
  getEquipmentLog: (data: any) => ipcRenderer.invoke("get-equipment-log", data),
  showToast: (message: string, success: boolean) => {
    window.postMessage({ type: "show-toast", message, success });
  },
  updateEquipmentQuantity: (data: any) => ipcRenderer.invoke("update-equipment-quantity", data),
  editEquipment: (data: any) => ipcRenderer.invoke("edit-equipment", data),
  exportItems: (tableName: string) => ipcRenderer.invoke("export-items", tableName),
  importItems: () => ipcRenderer.invoke("import-items"),
  addLog: (data: any) => ipcRenderer.invoke("add-log", data),
  getLog: () => ipcRenderer.invoke("get-log"),
  deleteAllLogs: () => ipcRenderer.invoke("delete-all-logs"),
  deleteSelectedItems: (tableName: string, selectedIds: (string | number)[]) => 
    ipcRenderer.invoke("delete-selected-items", { tableName, selectedIds }),
  checkLogin: (data: any) => ipcRenderer.invoke("check-login", data),
  autoLogin: () => ipcRenderer.invoke("auto-login"),
  logout: (username: string) => ipcRenderer.invoke("logout", username),
  addFirefighter: (data: any) => ipcRenderer.invoke('add-firefighter', data),
  getFirefighters: () => ipcRenderer.invoke("get-firefighters"),
  getFirefighterList: () => ipcRenderer.invoke("get-firefighter-list"),
});

