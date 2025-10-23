<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let intervalId: ReturnType<typeof setInterval> | null = null;

  onMount(() => {
    // Reload periodically to keep the dashboard fresh
    intervalId = setInterval(() => location.reload(), 30000);

    // Prevent sleep on compatible browsers
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').catch(() => {});
    }
  });

  onDestroy(() => intervalId && clearInterval(intervalId));
</script>

<main class="container">
  <header>
    <h1>Work Order Time Tracking</h1>
    <div class="text-right">
      <span class="status-indicator"></span>
      <strong>{data.records.length} orders</strong>
    </div>
  </header>

  {#if data.error}
    <div class="alert">
      <h3>{data.error}</h3>
    </div>
  {/if}

  {#if data.records.length > 0}
    <table class="u-full-width">
      <thead>
        <tr>
          <th>Work Order</th>
          <th>Employee</th>
          <th>Work Center</th>
          <th>Started</th>
        </tr>
      </thead>
      <tbody>
        {#each data.records as record}
          <tr>
            <td>{record.workorder_name || record.display_name}</td>

            <td>
              {#if record.employee_id && Array.isArray(record.employee_id)}
                <small>👤</small> {record.employee_id[1].replace(/[^a-zA-Z\s]/g,'').trim()}
              {:else}-{/if}
            </td>

            <td>
              {#if record.workcenter_id && Array.isArray(record.workcenter_id)}
                <small>⚙️</small> {record.workcenter_id[1]}
              {:else}-{/if}
            </td>

            <td >
              {#if record.date_start}
					<small>🕒</small>
                  {new Date(record.date_start).toLocaleDateString('en-US', {
                    day: '2-digit', month: '2-digit', timeZone: 'America/Toronto'
                  })}&nbsp;
                  {new Date(record.date_start).toLocaleTimeString('en-US', {
                    hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto'
                  })}
              {:else}-{/if}
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
