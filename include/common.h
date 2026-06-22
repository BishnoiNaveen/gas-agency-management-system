#ifndef COMMON_H
#define COMMON_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_NAME_LEN    50
#define MAX_PHONE_LEN   15
#define MAX_ADDR_LEN    100
#define MAX_PASSWORD_INPUT 30
#define MAX_RECORDS     200
#define DATA_DIR        "data"

#define CUSTOMER_FILE   DATA_DIR "/customers.dat"
#define CYLINDER_FILE   DATA_DIR "/cylinders.dat"
#define BOOKING_FILE    DATA_DIR "/bookings.dat"
#define BILL_FILE       DATA_DIR "/bills.dat"
#define REPORTS_DIR     DATA_DIR "/reports"

void clearInputBuffer(void);
void pauseScreen(void);
void clearScreen(void);
int readInt(const char *prompt, int min, int max);
double readDouble(const char *prompt, double min);
void readString(const char *prompt, char *buffer, int maxLen);
void readPassword(const char *prompt, char *buffer, int maxLen);
void readPhone(const char *prompt, char *buffer, int maxLen);
int generateId(const char *filename);
int ensureDataDirectory(void);
void ensureReportsDirectory(void);

#endif
