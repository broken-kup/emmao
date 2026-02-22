<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let name = $state('');
	let submitting = $state(false);

	const role = $derived(
		page.url.searchParams.get('role') === 'mentor' ? 'mentor' as const : 'companion' as const
	);

	const isMentor = $derived(role === 'mentor');

	onMount(() => {
		if ($user) goto('/');
	});

	function handleSubmit() {
		if (!name.trim() || submitting) return;
		submitting = true;
		user.login({ name: name.trim(), role });
		goto('/');
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gradient-to-b {isMentor ? 'from-blue-50 to-white' : 'from-purple-50 to-white'} p-4">
	<div class="w-full max-w-sm">
		<!-- Logo Area -->
		<div class="mb-8 text-center">
			<div class="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl {isMentor ? 'bg-blue-500' : 'bg-purple-500'} shadow-lg">
				<span class="text-3xl font-bold text-white">엠</span>
			</div>
			<h1 class="text-xl font-bold text-gray-900">엠마오로 가는 두 제자</h1>
			<div class="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 {isMentor ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">
				<span class="text-xs font-semibold">{isMentor ? '양육자' : '동반자'}</span>
			</div>
		</div>

		<!-- Login Form -->
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<form onsubmit={handleSubmit} class="space-y-5">
				<div>
					<label for="name" class="mb-1.5 block text-sm font-medium text-gray-700">
						이름
					</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						placeholder="이름을 입력하세요"
						class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-{isMentor ? 'blue' : 'purple'}-500 focus:ring-2 focus:ring-{isMentor ? 'blue' : 'purple'}-500/20 focus:outline-none"
						required
					/>
				</div>

				<button
					type="submit"
					disabled={!name.trim() || submitting}
					class="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40 {isMentor ? 'bg-blue-500' : 'bg-purple-500'}"
				>
					시작하기
				</button>
			</form>
		</div>

		<p class="mt-6 text-center text-xs text-gray-400">
			{isMentor ? '양육자' : '동반자'}로 로그인합니다
		</p>
	</div>
</div>
