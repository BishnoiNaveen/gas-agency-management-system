#ifndef CYLINDER_H
#define CYLINDER_H

#include "common.h"

typedef enum {
    CYLINDER_5KG  = 5,
    CYLINDER_14KG = 14,
    CYLINDER_19KG = 19
} CylinderType;

typedef struct {
    int id;
    CylinderType type;
    int filled;   /* available filled cylinders */
    int empty;    /* empty cylinders returned */
    double price; /* price per refill */
} CylinderStock;

void cylinderMenu(void);
int initCylinderStock(void);
void listCylinderStock(void);
void updateCylinderStock(void);
CylinderStock *findCylinderByType(CylinderType type);
const char *cylinderTypeName(CylinderType type);

#endif
