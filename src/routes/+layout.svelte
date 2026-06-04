<script>
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	// TEMP DEBUG: show what CSS viewport width the TV actually reports.
	let vw = $state(0);
	let vh = $state(0);
	let dpr = $state(0);

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

	function readViewport() {
		vw = window.innerWidth;
		vh = window.innerHeight;
		dpr = window.devicePixelRatio;
	}

	onMount(() => {
		requestWakeLock();
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// TEMP DEBUG
		readViewport();
		window.addEventListener('resize', readViewport);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			window.removeEventListener('resize', readViewport);
			wakeLock?.release().catch(() => {});
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
	<link rel="stylesheet" href="/app.css">
</svelte:head>

  <video muted loop autoplay playsinline
    src="https://tv.krka.ca/keepalive.mp4"
    style="position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;pointer-events:none;opacity:.01"></video>

{@render children?.()}

<!-- TEMP DEBUG: remove once the TV's reported viewport width is known -->
<div style="position:fixed;bottom:0;left:0;z-index:9999;background:#000;color:#0f0;
	font:bold 28px monospace;padding:8px 14px;">
	CSS {vw}×{vh} · DPR {dpr}
</div>
