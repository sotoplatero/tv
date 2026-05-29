<script>
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	/** @type {WakeLockSentinel | null} */
	let wakeLock = null;

	async function requestWakeLock() {
		try {
			if ('wakeLock' in navigator) {
				wakeLock = await navigator.wakeLock.request('screen');
				// The system may release it on its own; clear our ref so we re-acquire.
				wakeLock.addEventListener('release', () => {
					wakeLock = null;
				});
			}
		} catch (err) {
			console.warn('Wake Lock request failed:', err);
		}
	}

	function handleVisibilityChange() {
		// Browsers release the lock when the page is hidden — re-acquire on return.
		if (document.visibilityState === 'visible' && wakeLock === null) {
			requestWakeLock();
		}
	}

	onMount(() => {
		requestWakeLock();
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			wakeLock?.release().catch(() => {});
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">
	<link rel="stylesheet" href="/app.css">
</svelte:head>

{@render children?.()}
