import path from "path";
import { app } from "electron";
import fs, { stat } from "fs";
import { PrismaClient} from "@prisma/client";
import { EquipmentStatus, EquipmentLogStatus } from "@prisma/client";
import bcrypt from 'bcrypt';

// Determine database path
const isDev = !app.isPackaged; // Check if running in development

// Use the `db/` folder in development, but `userData` in production
const dbFileName = "inventory.db";
const dbPath = isDev
  ? path.join(__dirname, "..", "db", dbFileName) // Development: Use `db/`
  : path.join(app.getPath("userData"), dbFileName); // Production: Use `userData/`

  isDev ? console.log("Database Path:", dbPath)
  : console.log("Database Path (Production):", dbPath);
  
process.env.DATABASE_URL = `file:${dbPath}`;

console.log(dbPath)

// Ensure the database file exists in production
if (!isDev && !fs.existsSync(dbPath)) {
  try {
    // Copy the DB from the `app.asar` to `userData`
    const appDbPath = path.join(process.resourcesPath, dbFileName);
    fs.copyFileSync(appDbPath, dbPath);
    console.log("Database copied to:", dbPath);
  } catch (err) {
    console.error("Database copy error:", err);
  }
}

// Prisma Client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}?connection_limit=1`, // Ensure single connection
    },
  },
});

// Debugging output
console.log("Prisma is using database path:", dbPath);
console.log("Prisma Client Path:", path.dirname(require.resolve("@prisma/client")));

export { prisma };

export async function addEquipment(
  equipmentCode: string,
  equipmentName: string,
  quantity: number,
  unit: string,
  userId: string
) {
  // Check if the item_code already exists
  const existingItem = await prisma.equipment.findUnique({
    where: { equipmentCode },
  });

  if (existingItem) {
    throw new Error(
      `'${equipmentCode}' already exists.`
    );
  }

  // Insert new item
  const newItem = await prisma.equipment.create({
    data: {
      equipmentCode,
      equipmentName,
      quantity,
      unit,
      userId,
    },
  });

  return newItem;
}

export async function getEquipmentList() {
  return await prisma.equipment.findMany({
    orderBy: {
      equipmentName: "asc",
  },
  include: {
    user: true,
  },
  });
}

export async function updateEquipmentQuantity(
    id: string,
    new_quantity: number,
) {
    try {
        return await prisma.$transaction(async (tx) => {

            const newQuantity = Number(new_quantity)

            const equipment = await tx.equipment.findUnique({
                where: { id: id },
            });

            if (newQuantity < 0) {
                return { success: false, message: "Quantity cannot be negative." };
            }

            await tx.equipment.update({
                where: { id: id },
                data: {
                    quantity: { increment: newQuantity },
                },
            });

            return { success: true, message: "Quantity updated.", equipment: equipment };
        });
    } catch (error) {
        console.error(
            "Error updating equipment quantity:",
            (error as Error)?.message || "Unknown error"
        );
        return {
            success: false,
            message: (error as Error)?.message || "An unknown error occurred",
        };
    }
}

export async function editEquipment(
  id: string,
  equipmentCode: string,
  equipmentName: string,
  unit: string,
  status: EquipmentStatus
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const item = await tx.equipment.findUnique({
        where: { id: id },
      });

      if (!item) {
        return { success: false, message: "Item not found." };
      }

      if (item.equipmentCode === equipmentCode && item.equipmentName === equipmentName && item.unit === unit && item.status === status) {
        return {success: false, message: "No changes detected."}
      }

      const newItem = await tx.equipment.update({
        where: { id: id },
        data: {
          equipmentCode,
          equipmentName,
          unit,
          status,
        },
      });

      return {
        success: true,
        message: "Information updated.",
        equipment: item,
        newEquipment: newItem,
      };
    });
  } catch (error) {
    console.error(
      "Error updating item information:",
      (error as Error)?.message || "Unknown error"
    );
    return {
      success: false,
      message: (error as Error)?.message || "An unknown error occurred",
    };
  }
}

export async function addLog(
    userId: string,
    log: string
) {
    try {
        await prisma.log.create({
            data: {
                userId,
                log
            },
        })
        console.log("Log saved.")
        return { success: true, message: "Log created." }
    } catch (error) {
        console.log(`Error saving log: ${error}`)
        return { success: false, message: (error as Error).message }
    }
}

export async function getLog() {
    return await prisma.log.findMany({
        include: {
            user: true,
        },
        orderBy: {
          createdAt: "desc",
      },
    });
}

export async function deleteAllLogs() {
  try {
    const deletedLogs = await prisma.log.deleteMany();

    if (deletedLogs.count === 0) {
      return { success: false, message: "No logs to delete." };
    }
    console.log("All logs deleted.");
    return { success: true, message: "All logs deleted."}
  } catch (error) {
    console.error("Error deleting logs:", error);
    return { success: false, message: `An error occurs ${(error as Error).message}`}
  }
}

export async function pullEquipment(
    equipmentId: string,
    fireFighterId: string,
    releasedBy: string,
    quantity: number
): Promise<{ success: boolean; message: string; item?: object }> {
    try {
        return await prisma.$transaction(async (tx) => {

            const item = await tx.equipment.findUnique({
                where: { id: equipmentId },
            });

            if (!item) {
                throw new Error("Item not found.");
            }
            if (item.quantity < quantity) {
                throw new Error("Not enough stock available.");
            }

            await tx.equipmentLog.create({
                data: {
                  equipmentId,
                  fireFighterId,
                  releasedBy,
                  quantity,
                },
            });

            await tx.equipment.update({
                where: { id: equipmentId },
                data: {
                    quantity: { decrement: quantity },
                },
            });

            return {
                success: true,
                message: "Item successfully pulled.",
                item: item,
            };
        });
    } catch (error) {
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}

export async function returnEquipment(
    equipmentLogId: string
): Promise<{ success: boolean; message: string; item?: object }> {
    try {
        return await prisma.$transaction(async (tx) => {

            const equipmentLog = await tx.equipmentLog.findUnique({
                where: { id: equipmentLogId },
            });

            if (!equipmentLog) {
                throw new Error("Equipment log not found.");
            }

            const updatedItem = await tx.equipment.update({
                where: { id: equipmentLog.equipmentId },
                data: {
                    quantity: { increment: equipmentLog.quantity },
                },
            });

            await tx.equipmentLog.update({
                where: { id: equipmentLogId },
                data: {
                    status: "RETURNED",
                    returnedAt: new Date(),
                },
            });

            return {
                success: true,
                message: "Item successfully returned.",
                item: updatedItem,
            };
        });
    } catch (error) {
        return {
            success: false,
            message: (error as Error).message,
        };
    }
}

export async function returnMultipleEquipments(
  equipmentLogIds: string[]
): Promise<{ success: boolean; message: string; returnedItems?: object[] }> {
  try {
      return await prisma.$transaction(async (tx) => {
          const returnedItems = [];

          for (const equipmentLogId of equipmentLogIds) {
              const equipmentLog = await tx.equipmentLog.findUnique({
                  where: { id: equipmentLogId },
              });

              if (!equipmentLog) {
                  throw new Error(`Equipment log not found for ID: ${equipmentLogId}`);
              }

              const updatedItem = await tx.equipment.update({
                  where: { id: equipmentLog.equipmentId },
                  data: {
                      quantity: { increment: equipmentLog.quantity },
                  },
              });

              await tx.equipmentLog.update({
                  where: { id: equipmentLogId },
                  data: {
                      status: "RETURNED",
                      returnedAt: new Date(),
                  },
              });

              returnedItems.push(updatedItem);
          }

          return {
              success: true,
              message: `${returnedItems.length} item(s) returned.`,
              returnedItems,
          };
      });
  } catch (error) {
      return {
          success: false,
          message: (error as Error).message,
      };
  }
}


export async function getEquipmentLog(status: EquipmentLogStatus) {
  try {
    return await prisma.equipmentLog.findMany({
      where: { status },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        equipment: true,
        fireFighter: true,
      }
    });
  } catch (error) {
    console.log(error)
  }
}

export async function autoAccountCreate() {
  const username = "admin";
  const name = "admin";
  const isStaff = true;
  const isActive = true;
  const password = "admin1234";
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await prisma.user.create({
        data: {
          username,
          name,
          password: hashedPassword,
          isStaff: isStaff,
          isActive: isActive,
        },
      });
    } else {
      return;
    }
    console.log("User created successfully:");
    return;
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
}

export async function checkLogin(username: string, password: string) {
  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // If user not found
    if (!user) {
      return { success: false, message: 'Invalid username or password.' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return { success: false, message: 'Invalid username or password.' };
    }

    return { success: true, message: 'Login successful', user: user};
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, message: 'Internal server error' };
  }
}

