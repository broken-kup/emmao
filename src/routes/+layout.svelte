<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import { user } from '$lib/stores/user';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let { children } = $props();

	const isPublicPage = $derived(
		page.url.pathname === '/login' || page.url.pathname === '/admin'
	);

	$effect(() => {
		if (browser && !$user && !isPublicPage) {
			goto('/login');
		}
	});
</script>

{#if isPublicPage}
	{@render children()}
{:else}
	<div class="flex min-h-screen flex-col">
		<Header />
		<main class="flex-1 pt-12 pb-14">
			{@render children()}
		</main>
		<Nav />
	</div>
{/if}
