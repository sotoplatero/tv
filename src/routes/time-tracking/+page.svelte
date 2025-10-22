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
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
									<div class="flex items-center gap-1" style="justify-content: center;">
										<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										<small>
											{new Date(record.date_start).toLocaleDateString('en-US', {
												day: '2-digit',
												month: '2-digit',
												timeZone: 'America/Toronto'
											})}
											{new Date(record.date_start).toLocaleTimeString('en-US', {
												hour: '2-digit',
												minute: '2-digit',
												timeZone: 'America/Toronto'
											})}
										</small>
									</div>
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
