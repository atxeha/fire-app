import { app, BrowserWindow, ipcMain, Menu, shell, dialog } from "electron";
import fs from "fs";
import path from "path";
import {
  pullEquipment,
  updateEquipmentQuantity,
  addLog,
  getLog,
  deleteAllLogs,
  prisma,
  checkLogin,
  autoAccountCreate,
  getEquipmentList,
  addEquipment,
  editEquipment
} from "./database";
import { execSync } from "child_process";
import * as XLSX from "xlsx";

const isDev = !app.isPackaged;

if (!isDev) {
  try {
    console.log("Running Prisma Migration...");
    const output = execSync("npx prisma migrate deploy", {
      stdio: "pipe",
      encoding: "utf-8",
    });
    console.log("Migration Output:\n", output);
  } catch (error: any) {
    console.error("Migration Error:\n", error.message);
  }
}

function capitalizeWords(str: string) {
  return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
}

let mainWindow: BrowserWindow | null;
app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    icon: path.join(__dirname, "../assets/icons/fire-logo-min.ico"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(app.getAppPath(), "public", "login.html"));

  autoAccountCreate()
    .then(() => console.log("Account created successfully"))
    .catch((error) => console.error("Error creating account:", error.message));

  Menu.setApplicationMenu(menu);
});

const menu = Menu.buildFromTemplate([
  {
    label: "File",
    submenu: [
      {
        label: "Import",
        click: () => {
          console.log("Import clicked!");
        },
      },
      {
        label: "Export",
        click: () => {
          console.log("Export clicked!");
        },
      },
      { type: "separator" },
      {
        label: "New Stock",
        click: () => {
          console.log("New stock clicked!");
        },
      },
      {
        label: "View Pulled Items",
        click: () => {
          console.log("View pulled Items clicked!");
        },
      },
      {
        label: "View Added Items",
        click: () => {
          console.log("View Added Items clicked!");
        },
      },
      { type: "separator" },
      {
        label: "Exit",
        role: "quit",
      },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { label: "Undo", role: "undo" },
      { label: "Redo", role: "redo" },
      { type: "separator" },
      { label: "Cut", role: "cut" },
      { label: "Copy", role: "copy" },
      { label: "Paste", role: "paste" },
    ],
  },
  {
    label: "View",
    submenu: [
      {
        label: "Reload",
        role: "reload",
      },
      {
        label: "Toggle DevTools",
        role: "toggleDevTools",
      },
    ],
  },
  {
    label: "Help",
    submenu: [
      {
        label: "Developer",
        click: () => {
          shell.openExternal("https://www.facebook.com/a1yag/");
        },
      },
      {
        label: "About",
        click: () => {
          console.log("About clicked!");
        },
      },
    ],
  },
]);

ipcMain.handle("add-equipment", async (event, equipmentData) => {
    try {
        const equipment = await addEquipment(
            equipmentData.equipmentCode,
            equipmentData.equipmentName,
            equipmentData.quantity,
            equipmentData.unit,
            equipmentData.userId,
        );
        return { success: true, message: "Equipment successfully added.",  equipment: equipment};
    } catch (error: any) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle("add-log", async (event, logData) => {
    try {
        return await addLog(
            logData.userId,
            logData.log
        )
    } catch (error) {
        return;
    }
})

ipcMain.handle("get-log", async () => {
  try {
    return await getLog();
} catch (error) {
    return;
}
})

ipcMain.handle("delete-all-logs", async () => {
    return await deleteAllLogs();
  });

ipcMain.handle("pull-equipment", async (event, pullData) => {
  const item = await pullEquipment(
    pullData.equipmentId,
    pullData.fireFighterId,
    pullData.releasedBy,
    pullData.quantity
  );
  if (item.success) {
    return { success: true, message: "Item successfully pulled.", item: item };
  } else {
    console.log(item);
    return { success: false, message: item }; // Return the error message
  }
});

ipcMain.handle("get-equipment-list", async () => {
  try {
    return getEquipmentList(); // Fetch and return all items
  } catch (error) {
    console.error("Error fetching equipments:", error);
    return [];
  }
});

// ipcMain.handle("get-pull-items", async () => {
//   try {
//     return getPullItems();
//   } catch (error) {
//     console.error("Error fetching pulled items.", error);
//     return [];
//   }
// });

ipcMain.handle("update-equipment-quantity", async (event, newQuantityData) => {
  const { id, new_quantity} = newQuantityData;
  return updateEquipmentQuantity(id, new_quantity);
});

ipcMain.handle("edit-equipment", async (event, newData) => {
  try {
    return editEquipment(
      newData.id,
      newData.equipmentCode,
      newData.equipmentName,
      newData.unit,
      newData.status
    )
  } catch (error) {
    return;
  }
})

ipcMain.on("navigate", (event, page) => {
  const filePath = path.join(app.getAppPath(), "public", page);
  console.log("Loading file:", filePath);

  if (!fs.existsSync(filePath)) {
      console.error("File does not exist:", filePath);
      return;
  }

  if (mainWindow) {
      mainWindow.loadFile(filePath);
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("export-items", async (event, { tableName, selectedIds }: { tableName: string, selectedIds: string[] }) => {
    try {
        const validTables = ["equipment", "pulledItem", "log", "addedItem"];
        if (!validTables.includes(tableName)) {
            return { success: false, message: `Invalid table: ${tableName}` };
        }

        if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
          return { success: false, message: "No items selected." };
      }
      
      const data = await (prisma as any)[tableName].findMany({
          where: {
              id: {
                  in: selectedIds.map(String),
              },
          },
          include: { user: true },
      });

        if (!data.length) {
            return { success: false, message: `No matching data found in ${tableName}.` };
        }

        const columnMappings: Record<string, Record<string, string>> = {
            equipment: {
                equipmentCode: "Code",
                equipmentName: "Item",
                quantity: "Quantity",
                unit: "Unit",
                status: "Status",
                user: "Added by",
                createdAt: "Date"
            },
            pulledItem: {
                itemCode: "Code",
                itemName: "Name",
                releasedQuantity: "Quantity",
                unit: "Unit",
                releasedBy: "Released by",
                receivedBy: "Received by",
                releasedDate: "Date"
            },
            addedItem: {
                itemCode: "Code",
                itemName: "Name",
                addedQuantity: "Quantity",
                unit: "Unit",
                addedBy: "Added by",
                addedDate: "Date"
            }
        };

        const formattedData = data.map(({ user, id, updatedBy, updatedAt, ...rest }: any) => {
            const formattedRow: Record<string, any> = {};
            for (const key in rest) {
                if (columnMappings[tableName]?.[key]) {
                    formattedRow[columnMappings[tableName][key]] = rest[key];
                }
            }

            if (user && user.name) {
              formattedRow["Added by"] = user.name;
            }

            return formattedRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, tableName);

        const { filePath } = await dialog.showSaveDialog({
            title: `Save ${tableName}.xlsx`,
            defaultPath: `${tableName}.xlsx`,
            filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
        });

        if (!filePath) return;

        XLSX.writeFile(workbook, filePath);
        return { success: true, message: `${capitalizeWords(tableName)} exported.` };
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, message: `Failed to export ${tableName}: ${error}.` };
    }
});

ipcMain.handle("delete-selected-items", async (event, { tableName, selectedIds }: { tableName: string, selectedIds: (string | number)[] }) => {
  try {
    const validTables = ["equipment", "equipmentLog", "firefighter"];
    if (!validTables.includes(tableName)) {
      return { success: false, message: `Invalid table: ${tableName} sdds` };
    }

    if (!selectedIds || selectedIds.length === 0) {
      return { success: false, message: "No items selected." };
    }

    const tablesWithIntIds = ["item", "log"];
    const formattedIds =
      tablesWithIntIds.includes(tableName) 
        ? selectedIds.map(id => (typeof id === "string" ? parseInt(id, 10) : id))
        : selectedIds;

    const result = await (prisma as any)[tableName].deleteMany({
      where: { id: { in: formattedIds } },
    });

    if (result.count === 0) {
      return { success: false, message: `No matching records found in ${tableName}.` };
    }

    return { success: true, message: `${result.count} item(s) deleted.` };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, message: `Failed to delete items from ${tableName}.` + (error as Error).message };
  }
});

ipcMain.handle("check-login", async (event, data) => {
  try {
      const response = await checkLogin(
          data.username,
          data.password
      )
      return response;
  } catch (error: any) {
      return;
  }
})

ipcMain.handle('add-firefighter', async (_, firefighterData) => {
    try {
        const firefighter = await prisma.firefighter.findUnique({
            where: { employeeId: firefighterData.employeeId }
        })
        if (firefighter) {
            return { success: false, message: `Firefighter with ID '${firefighter.employeeId}' already exists.` };
        }
        const newFirefighter = await prisma.firefighter.create({
            data: firefighterData,
        });
        return { success: true, message: "Firefighter added successfully.", newFirefighter: newFirefighter };
    } catch (error) {
        return { success: false, message: (error as Error).message };
    }
});

ipcMain.handle("get-firefighters", async () => {
    try {
      const firefighters = await prisma.firefighter.findMany({
        select: {
          id: true,
          name: true,
        },
      });
      return { success: true, data: firefighters };
    } catch (error) {
      console.error("Error fetching firefighters:", error);
      return { success: false, message: (error as Error).message };
    }
  });
  
