import { createOdooClient } from '$lib/odoo-client.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  try {
    const client = createOdooClient();

    // Autenticar
    const authenticated = await client.authenticate();
    if (!authenticated) {
      return {
        records: [],
        error: 'Authentication failed'
      };
    }

    // Obtener datos de Work Order Time Tracking
    const MODEL_NAME = 'mrp.workcenter.productivity';
    const FIELDS = [
      'id', 'display_name', 'description', 'date_start', 'date_end', 'duration',
      'employee_id', 'user_id', 'workcenter_id', 'workorder_id', 'workorder_name',
      'production_id', 'product_name', 'loss_id', 'loss_type', 'workorder_state',
      'time_remaining', 'highlight_remaining', 'total_cost', 'currency_id'
    ];
    const DOMAIN = [['date_end', '=', false], ['workorder_state', '=', 'progress']];

    const records = await client.searchRead(MODEL_NAME, DOMAIN, FIELDS, {
      limit: 50
    });

    return {
      records,
      error: null
    };

  } catch (error) {
    console.error('Error loading Odoo data:', error);
    return {
      records: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
