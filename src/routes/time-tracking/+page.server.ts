import { createOdooClient } from '$lib/odoo-client.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ depends }) => {
  depends('app:time-tracking');
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

    // Fetch employee avatars (Odoo stores them as base64 on hr.employee.image_128)
    const employeeIds = [
      ...new Set(
        records
          .filter((r: any) => Array.isArray(r.employee_id))
          .map((r: any) => r.employee_id[0])
      )
    ];

    const imageById = new Map<number, string>();
    if (employeeIds.length > 0) {
      const employees = await client.read('hr.employee', employeeIds, ['id', 'image_128']);
      for (const emp of employees) {
        if (emp.image_128) imageById.set(emp.id, emp.image_128);
      }
    }

    const recordsWithAvatars = records.map((r: any) => ({
      ...r,
      employee_image: Array.isArray(r.employee_id) ? imageById.get(r.employee_id[0]) ?? null : null
    }));

    return {
      records: recordsWithAvatars,
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
