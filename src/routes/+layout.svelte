<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/Header.svelte';
	import Nav from '$lib/components/Nav.svelte';
	import UserSetup from '$lib/components/UserSetup.svelte';
	import { user } from '$lib/stores/user';

	let { children } = $props();
</script>

{#if !$user}
	<UserSetup />
{/if}

<div class="flex min-h-screen flex-col">
	<Header />
	<main class="flex-1 pt-12 pb-14">
		{@render children()}
	</main>
	<Nav />
</div>
