#ifndef AUTH_H
#define AUTH_H

#include "common.h"

#define MAX_USERNAME_LEN 50
#define MAX_PASSWORD_LEN 30
#define MAX_LOGIN_ATTEMPTS 3

int adminLogin(void);
const char *getAdminUsername(void);

#endif
