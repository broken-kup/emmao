<script lang="ts">
	import { Plus, LogOut } from 'lucide-svelte';
	import { user } from '$lib/stores/user';
	import { goto } from '$app/navigation';

	function handleLogout() {
		const role = $user?.role || 'companion';
		user.logout();
		goto(`/login?role=${role}`);
	}
</script>

<header class="fixed top-0 right-0 left-0 z-40 flex h-12 items-center justify-between border-b border-[var(--color-border)] bg-white px-4">
	<div class="flex items-center gap-2">
		<a
			href="/posts/new"
			class="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-gray-100"
			aria-label="새 게시물"
		>
			<Plus size={22} strokeWidth={2} />
		</a>
		{#if $user}
			<div class="flex items-center gap-1">
				<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {$user.role === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
					{$user.role === 'mentor' ? '양육자' : '동반자'}
				</span>
				<span class="text-[10px] text-gray-400">
					{$user.mentorName} · {$user.companionName}
				</span>
			</div>
		{/if}
	</div>

	<h1 class="text-xs font-bold tracking-tight">엠마오 동행일기</h1>

	<button
		onclick={handleLogout}
		class="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
		aria-label="로그아웃"
	>
		<LogOut size={16} />
	</button>
</header>
