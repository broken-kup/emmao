<script lang="ts">
	import { Plus } from 'lucide-svelte';
</script>

<header class="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-between border-b border-[var(--color-border)] bg-white px-4">
	<a
		href="/posts/new"
		class="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
		aria-label="새 게시물"
	>
		<Plus size={22} strokeWidth={2} />
	</a>
	<h1 class="text-sm font-bold tracking-tight">엠마오로 가는 두 제자</h1>
</header>
