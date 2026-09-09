window.GAMS_API = (() => {
  const { TOKEN_KEY } = window.GAMS_CONFIG;
  let token = localStorage.getItem(TOKEN_KEY);
  let apiMode = false;

  function getBase() {
    if (window.GAMS_CONFIG.API_BASE) return window.GAMS_CONFIG.API_BASE;
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return 'http://localhost:3000';
    return '';
  }

  async function request(path, options = {}) {
    const base = getBase();
    if (!base && (window.location.hostname.includes('github.io') || window.location.protocol === 'https:')) {
      throw new Error('Running in 24/7 Cloud Client Mode');
    }
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    let res;
    try {
      res = await fetch(`${base}${path}`, { ...options, headers });
    } catch {
      throw new Error('Cannot reach server');
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
    return body;
  }

  return {
    isApiMode: () => apiMode,
    setApiMode(v) { apiMode = v; },
    getToken: () => token,
    setToken(t) {
      token = t;
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    },
    async checkHealth() {
      const base = getBase();
      if (!base && (window.location.hostname.includes('github.io') || window.location.protocol === 'https:')) {
        return false;
      }
      try {
        await request('/api/health');
        return true;
      } catch {
        return false;
      }
    },
    async adminLogin(username, password) {
      const r = await request('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      token = r.token;
      localStorage.setItem(TOKEN_KEY, r.token);
      apiMode = true;
      return r;
    },
    async customerLogin(username, password) {
      const r = await request('/api/auth/customer/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      token = r.token;
      localStorage.setItem(TOKEN_KEY, r.token);
      apiMode = true;
      return r;
    },
    async registerCustomer(payload) {
      return request('/api/auth/customer/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    async resetAdminPassword(username, recoveryCode, newPassword) {
      return request('/api/auth/admin/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username, recoveryCode, newPassword }),
      });
    },
    async resetCustomerPassword(username, phone, newPassword) {
      return request('/api/auth/customer/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ username, phone, newPassword }),
      });
    },
    async changeAdminPassword(currentPassword, newPassword) {
      return request('/api/auth/admin/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
    async loadData() {
      const data = await request('/api/data');
      apiMode = true;
      return data;
    },
    async saveData(data) {
      return request('/api/data', { method: 'PUT', body: JSON.stringify(data) });
    },
  };
})();
