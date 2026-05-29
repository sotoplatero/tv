<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invalidate } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let dataInterval: ReturnType<typeof setInterval> | null = null;
  let clockInterval: ReturnType<typeof setInterval> | null = null;

  // Live clock / elapsed driver
  let now = $state(new Date());

  onMount(() => {
    // Reload data periodically without full page refresh.
    // (Screen wake lock is handled app-wide in +layout.svelte.)
    dataInterval = setInterval(() => invalidate('app:time-tracking'), 30000);
    clockInterval = setInterval(() => (now = new Date()), 1000);
  });

  onDestroy(() => {
    if (dataInterval) clearInterval(dataInterval);
    if (clockInterval) clearInterval(clockInterval);
  });

  const TZ = 'America/Toronto';

  /** Odoo datetimes are UTC with no timezone marker — parse them as UTC. */
  function parseOdoo(s: string): Date {
    return new Date(s.replace(' ', 'T') + 'Z');
  }

  function cleanName(raw: string): string {
    return raw.replace(/[^a-zA-Z\s]/g, '').trim();
  }

  function initials(raw: string): string {
    const parts = cleanName(raw).split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }

  function startedTime(s: string): string {
    return parseOdoo(s).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', timeZone: TZ
    });
  }

  const clock = $derived(
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: TZ })
  );
</script>

<main class="dashboard">
  <header class="dash-header">
    <h1>Work Order Time Tracking</h1>
    <div class="dash-meta">
      <span class="status-indicator"></span>
      <span class="count">{data.records.length} active</span>
      <span class="clock">{clock}</span>
    </div>
  </header>

  {#if data.error}
    <div class="alert">
      <h3>{data.error}</h3>
    </div>
  {/if}

  {#if data.records.length > 0}
    <table class="roster">
      <colgroup>
        <col style="width: 22%" />
        <col style="width: 34%" />
        <col style="width: 22%" />
        <col style="width: 22%" />
      </colgroup>
      <thead>
        <tr>
          <th>Employee</th>
          <th>Work Order</th>
          <th>Work Center</th>
          <th>Started</th>
        </tr>
      </thead>
      <tbody>
        {#each data.records as record}
          <tr>
            <td class="cell-employee">
              <div class="employee">
                {#if record.employee_image}
                  <img
                    class="avatar"
                    src={`data:image/png;base64,${record.employee_image}`}
                    alt=""
                  />
                {:else}
                  <span class="avatar avatar--fallback">
                    {#if record.employee_id && Array.isArray(record.employee_id)}
                      {initials(record.employee_id[1])}
                    {:else}?{/if}
                  </span>
                {/if}
                <span class="employee-name">
                  {#if record.employee_id && Array.isArray(record.employee_id)}
                    {cleanName(record.employee_id[1])}
                  {:else}—{/if}
                </span>
              </div>
            </td>

            <td>{record.workorder_name || record.display_name}</td>

            <td>
              {#if record.workcenter_id && Array.isArray(record.workcenter_id)}
                <small>⚙️</small> {record.workcenter_id[1]}
              {:else}—{/if}
            </td>

            <td>
              {#if record.date_start}
                <span class="started-time">🕒 {startedTime(record.date_start)}</span>
              {:else}—{/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="empty-state">
      <h2>No Active Orders</h2>
      <p>All work orders have been completed</p>
    </div>
  {/if}
</main>
