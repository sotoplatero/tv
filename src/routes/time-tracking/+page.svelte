<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Start automatic page reload polling
	onMount(() => {
		// Configure polling - reload entire page every 30 seconds
		intervalId = setInterval(() => {
			location.reload();
		}, 30000);

		// Prevent screen from turning off
		if ('wakeLock' in navigator) {
			navigator.wakeLock.request('screen').catch(() => {
				console.log('Wake lock not supported or failed');
			});
		}
	});

	// Clean up polling on unmount
	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<main class="container-fluid h-screen flex flex-col overflow-hidden">
	<!-- Header -->
	<header class="flex justify-between items-center shrink-0" style="margin-bottom: 1rem;">
		<hgroup>
			<h1>Work Order Time Tracking</h1>
		</hgroup>

		<!-- Status indicator -->
		<div class="flex items-center gap-4 text-right">
			<div class="flex items-center gap-2">
				<span class="status-indicator status-online"></span>
				<strong>Online</strong>
			</div>
			<small>{data.records.length} orders</small>
		</div>
	</header>

	{#if data.error}
		<!-- Error message -->
		<article style="background-color: var(--pico-del-color); margin-bottom: 1rem;">
			<header class="text-center">
				<h3>{data.error}</h3>
			</header>
		</article>
	{/if}

	{#if data.records.length > 0}
		<!-- Table container -->
		<div class="flex-1 min-h-0 overflow-y-auto">
			<table class="tv-table" role="grid">
				<thead>
					<tr>
						<th scope="col" style="width: 30%;">Work Order</th>
						<th scope="col" style="width: 25%;">Employee</th>
						<th scope="col" style="width: 25%;">Work Center</th>
						<th scope="col" style="width: 20%;" class="text-center">Started</th>
					</tr>
				</thead>
				<tbody>
					{#each data.records as record}
						<tr>
							<!-- Work Order -->
							<td>
								<strong class="truncate" style="display: block;">
									{record.workorder_name || record.display_name}
								</strong>
							</td>

							<!-- Employee -->
							<td>
								{#if record.employee_id && Array.isArray(record.employee_id)}
									<div class="flex items-center gap-1">
										<svg class="icon icon-user" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										<span class="truncate">{record.employee_id[1]}</span>
									</div>
								{:else}
									-
								{/if}
							</td>

							<!-- Work Center -->
							<td>
								{#if record.workcenter_id && Array.isArray(record.workcenter_id)}
									<div class="flex items-center gap-1">
										<svg class="icon icon-workcenter" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
										</svg>
										<span class="truncate">{record.workcenter_id[1]}</span>
									</div>
								{:else}
									-
								{/if}
							</td>

							<!-- Started Time -->
							<td class="text-center">
								{#if record.date_start}
									<small>
										{new Date(record.date_start).toLocaleDateString('en', {
											day: '2-digit',
											month: '2-digit'
										})}
										{new Date(record.date_start).toLocaleTimeString('en', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</small>
								{:else}
									-
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<!-- Empty state -->
		<article class="text-center">
			<hgroup>
				<h2>No Active Orders</h2>
				<p>All work orders have been completed</p>
			</hgroup>
		</article>
	{/if}
</main>
