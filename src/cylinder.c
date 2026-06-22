#include "../include/cylinder.h"

const char *cylinderTypeName(CylinderType type) {
    switch (type) {
        case CYLINDER_5KG:  return "5 KG";
        case CYLINDER_14KG: return "14 KG";
        case CYLINDER_19KG: return "19 KG";
        default:            return "Unknown";
    }
}

CylinderStock *findCylinderByType(CylinderType type) {
    static CylinderStock stock;
    FILE *fp = fopen(CYLINDER_FILE, "rb");
    CylinderStock record;

    if (!fp) {
        return NULL;
    }

    while (fread(&record, sizeof(CylinderStock), 1, fp) == 1) {
        if (record.type == type) {
            fclose(fp);
            stock = record;
            return &stock;
        }
    }

    fclose(fp);
    return NULL;
}

int initCylinderStock(void) {
    FILE *fp;
    CylinderStock defaults[3];
    int i;

    if (findCylinderByType(CYLINDER_5KG)) {
        return 1;
    }

    ensureDataDirectory();

    defaults[0].id = 1;
    defaults[0].type = CYLINDER_5KG;
    defaults[0].filled = 50;
    defaults[0].empty = 10;
    defaults[0].price = 450.00;

    defaults[1].id = 2;
    defaults[1].type = CYLINDER_14KG;
    defaults[1].filled = 80;
    defaults[1].empty = 20;
    defaults[1].price = 950.00;

    defaults[2].id = 3;
    defaults[2].type = CYLINDER_19KG;
    defaults[2].filled = 60;
    defaults[2].empty = 15;
    defaults[2].price = 1150.00;

    fp = fopen(CYLINDER_FILE, "wb");
    if (!fp) {
        return 0;
    }

    for (i = 0; i < 3; i++) {
        fwrite(&defaults[i], sizeof(CylinderStock), 1, fp);
    }

    fclose(fp);
    return 1;
}

void listCylinderStock(void) {
    FILE *fp = fopen(CYLINDER_FILE, "rb");
    CylinderStock record;

    printf("\n--- Cylinder Inventory ---\n");
    printf("%-6s %-10s %-10s %-10s %-12s\n", "ID", "Type", "Filled", "Empty", "Price (Rs)");
    printf("------------------------------------------------------\n");

    if (!fp) {
        printf("No inventory data. Initializing default stock...\n");
        initCylinderStock();
        listCylinderStock();
        return;
    }

    while (fread(&record, sizeof(CylinderStock), 1, fp) == 1) {
        printf("%-6d %-10s %-10d %-10d %-12.2f\n",
               record.id,
               cylinderTypeName(record.type),
               record.filled,
               record.empty,
               record.price);
    }

    fclose(fp);
}

void updateCylinderStock(void) {
    int typeChoice;
    CylinderType type;
    CylinderStock records[10];
    int total = 0;
    int i;
    int addFilled;
    int addEmpty;
    FILE *fp;

    listCylinderStock();

    typeChoice = readInt("\nSelect cylinder type (1=5KG, 2=14KG, 3=19KG): ", 1, 3);
    switch (typeChoice) {
        case 1: type = CYLINDER_5KG; break;
        case 2: type = CYLINDER_14KG; break;
        default: type = CYLINDER_19KG; break;
    }

    addFilled = readInt("Add filled cylinders (0 if none): ", 0, 1000);
    addEmpty  = readInt("Add empty cylinders (0 if none): ", 0, 1000);

    fp = fopen(CYLINDER_FILE, "rb");
    if (!fp) {
        printf("Inventory file not found.\n");
        return;
    }

    while (fread(&records[total], sizeof(CylinderStock), 1, fp) == 1 && total < 10) {
        total++;
    }
    fclose(fp);

    for (i = 0; i < total; i++) {
        if (records[i].type == type) {
            records[i].filled += addFilled;
            records[i].empty += addEmpty;
            records[i].price = readDouble("Enter new price per cylinder (Rs): ", 1.0);
            break;
        }
    }

    fp = fopen(CYLINDER_FILE, "wb");
    if (!fp) {
        printf("Error saving inventory.\n");
        return;
    }

    for (i = 0; i < total; i++) {
        fwrite(&records[i], sizeof(CylinderStock), 1, fp);
    }
    fclose(fp);

    printf("Inventory updated successfully.\n");
}

void cylinderMenu(void) {
    int choice;

    initCylinderStock();

    while (1) {
        clearScreen();
        printf("====================================\n");
        printf("       CYLINDER INVENTORY\n");
        printf("====================================\n");
        printf("1. View Inventory\n");
        printf("2. Update Stock / Price\n");
        printf("0. Back to Main Menu\n");
        printf("------------------------------------\n");

        choice = readInt("Enter your choice: ", 0, 2);

        switch (choice) {
            case 1: listCylinderStock(); pauseScreen(); break;
            case 2: updateCylinderStock(); pauseScreen(); break;
            case 0: return;
            default: break;
        }
    }
}
