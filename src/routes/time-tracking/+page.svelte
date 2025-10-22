<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let lastUpdate = $state(new Date());
	let intervalId: ReturnType<typeof setInterval> | null = null;

	// Start automatic page reload polling
	onMount(() => {
		// Save current time
		lastUpdate = new Date();

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

	// Format time to show "X minutes ago"
	function getTimeAgo(date: Date): string {
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMin = Math.floor(diffMs / 60000);

		if (diffMin < 1) return 'Now';
		if (diffMin === 1) return '1 minute ago';
		return `${diffMin} minutes ago`;
	}
</script>

<!-- Full screen TV layout - maximized content density for no-scroll display -->
<div class="h-screen w-full bg-gray-50 p-2 md:p-3 lg:p-4 flex flex-col overflow-hidden">
	<!-- Compact header - single line optimized -->
	<div class="flex justify-between items-center mb-2 md:mb-3 lg:mb-4 shrink-0">
		<div>
			<h1 class="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">Work Order Time Tracking</h1>
		</div>

		<!-- Compact status indicator -->
		<div class="flex items-center gap-4 lg:gap-6 text-right">
			<div class="flex items-center gap-2">
				<div class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full bg-green-500"></div>
				<span class="text-lg md:text-xl lg:text-2xl xl:text-3xl text-gray-700">Online</span>
			</div>
			<div class="text-sm md:text-base lg:text-lg xl:text-xl text-gray-500">
				{data.records.length} orders
			</div>
		</div>
	</div>

	{#if data.error}
		<!-- Compact error message -->
		<div class="bg-red-50 border-2 border-red-300 p-4 md:p-6 mb-3 md:mb-4 text-center rounded-xl shrink-0">
			<h3 class="text-2xl md:text-3xl lg:text-4xl font-bold text-red-800">{data.error}</h3>
		</div>
	{/if}

	{#if data.records.length > 0}
		<!-- Ultra-compact table - maximum rows visible -->
		<div class="bg-white overflow-hidden border-2 border-gray-300 flex flex-col min-h-0 flex-1">
			<!-- Minimal table header -->
			<div class="bg-gray-900 text-white grid grid-cols-9 gap-2 md:gap-3 lg:gap-4 px-2 md:px-3 lg:px-4 py-1.5 md:py-2 lg:py-2 text-sm md:text-base lg:text-lg xl:text-xl font-bold uppercase shrink-0">
				<div class="col-span-3">Work Order</div>
				<div class="col-span-2">Employee</div>
				<div class="col-span-2">Work Center</div>
				<div class="col-span-2 text-center">Started</div>
			</div>

			<!-- Ultra-compact table rows - NO SCROLL -->
			<div class="divide-y divide-gray-200 flex-1">
				{#each data.records as record, index}
					<div class="grid grid-cols-9 gap-2 md:gap-3 lg:gap-4 px-2 md:px-3 lg:px-4 py-1 md:py-1.5 lg:py-2 items-center hover:bg-gray-50 transition-colors {
						index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
					}">
						<!-- Work Order - single line with ellipsis -->
						<div class="col-span-3">
							<div class="text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">
								{record.workorder_name || record.display_name}
							</div>
						</div>

						<!-- Employee - compact with small icon -->
						<div class="col-span-2">
							{#if record.employee_id && Array.isArray(record.employee_id)}
								<div class="flex items-center gap-1 md:gap-2">
									<svg class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
									</svg>
									<span class="text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-gray-900 truncate">{record.employee_id[1]}</span>
								</div>
							{:else}
								<span class="text-sm md:text-base lg:text-lg xl:text-xl text-gray-400">-</span>
							{/if}
						</div>

						<!-- Work Center - compact with small icon -->
						<div class="col-span-2">
							{#if record.workcenter_id && Array.isArray(record.workcenter_id)}
								<div class="flex items-center gap-1 md:gap-2">
									<svg class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-purple-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
									</svg>
									<span class="text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-gray-900 truncate">{record.workcenter_id[1]}</span>
								</div>
							{:else}
								<span class="text-sm md:text-base lg:text-lg xl:text-xl text-gray-400">-</span>
							{/if}
						</div>

						<!-- Started Time - single line compact -->
						<div class="col-span-2 text-center">
							<div class="text-xs md:text-sm lg:text-base xl:text-lg font-semibold text-gray-900">
								{#if record.date_start}
									{new Date(record.date_start).toLocaleDateString('en', {
										day: '2-digit',
										month: '2-digit'
									})}
									{new Date(record.date_start).toLocaleTimeString('en', {
										hour: '2-digit',
										minute: '2-digit'
									})}
								{:else}
									-
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Empty state: min 24pt for main message -->
		<div class="text-center py-16 md:py-20 lg:py-24 shrink-0">
			<div class="text-gray-500">
				<p class="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4">No Active Orders</p>
				<p class="text-lg md:text-xl lg:text-2xl xl:text-3xl">All work orders have been completed</p>
			</div>
		</div>
	{/if}
</div>

<style>
	/* Prevent text selection on TV */
	* {
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
	}
</style>
