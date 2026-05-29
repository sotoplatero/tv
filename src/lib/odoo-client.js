import { env } from '$env/dynamic/private';

export class OdooClient {
  constructor(config) {
    this.config = config;
    this.uid = null;
    this.sessionId = null;
  }

  async makeRequest(endpoint, params) {
    const payload = {
      jsonrpc: '2.0',
      method: 'call',
      params,
      id: Math.floor(Math.random() * 1000)
    };

    const response = await fetch(`${this.config.url}/jsonrpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.sessionId && { 'Cookie': `session_id=${this.sessionId}` })
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Odoo error: ${data.error.message}`);
    }

    return data.result;
  }

  async authenticate() {
    try {
      const result = await this.makeRequest('common', {
        service: 'common',
        method: 'authenticate',
        args: [this.config.database, this.config.username, this.config.password, {}]
      });

      if (result) {
        this.uid = result;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  async searchRead(model, domain = [], fields = [], options = {}) {
    if (!this.uid) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    return await this.makeRequest('object', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.database,
        this.uid,
        this.config.password,
        model,
        'search_read',
        [domain],
        {
          fields,
          ...options
        }
      ]
    });
  }

  async read(model, ids, fields = []) {
    if (!this.uid) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    return await this.makeRequest('object', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.database,
        this.uid,
        this.config.password,
        model,
        'read',
        [ids],
        { fields }
      ]
    });
  }

  async search(model, domain = [], options = {}) {
    if (!this.uid) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    return await this.makeRequest('object', {
      service: 'object',
      method: 'execute_kw',
      args: [
        this.config.database,
        this.uid,
        this.config.password,
        model,
        'search',
        [domain],
        options
      ]
    });
  }
}

export function createOdooClient() {
  // Read at runtime (works with runtime-injected env vars in Docker/Dokploy)
  const { ODOO_URL, ODOO_DATABASE, ODOO_USERNAME, ODOO_PASSWORD } = env;

  // Validate required environment variables
  if (!ODOO_URL || !ODOO_DATABASE || !ODOO_USERNAME || !ODOO_PASSWORD) {
    throw new Error('Missing required Odoo environment variables. Check your .env file.');
  }

  const config = {
    url: ODOO_URL,
    database: ODOO_DATABASE,
    username: ODOO_USERNAME,
    password: ODOO_PASSWORD
  };

  return new OdooClient(config);
}
