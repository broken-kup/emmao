<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	let myName = $state('');
	let partnerName = $state('');
	let submitting = $state(false);

	let selectedRole = $state<'mentor' | 'companion' | null>(null);

	const urlRole = $derived(page.url.searchParams.get('role'));
	const role = $derived(selectedRole);
	const isMentor = $derived(role === 'mentor');

	onMount(() => {
		if ($user) goto('/');
		if (urlRole === 'mentor' || urlRole === 'companion') {
			selectedRole = urlRole;
		}
	});

	function selectRole(r: 'mentor' | 'companion') {
		selectedRole = r;
		myName = '';
		partnerName = '';
	}

	function handleSubmit() {
		if (!role || !myName.trim() || !partnerName.trim() || submitting) return;
		submitting = true;

		const mentorName = isMentor ? myName.trim() : partnerName.trim();
		const companionName = isMentor ? partnerName.trim() : myName.trim();

		user.login({
			name: myName.trim(),
			role,
			mentorName,
			companionName,
			pairKey: `${mentorName}::${companionName}`
		});
		goto('/');
	}
</script>

<div class="flex min-h-screen flex-col bg-white">
	<div class="relative w-full">
		<img
			src="/logo.png"
			alt="엠마오로 가는 두 제자"
			class="h-56 w-full object-cover sm:h-64"
		/>
		<div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-white"></div>
	</div>

	<div class="relative -mt-6 flex flex-1 flex-col items-center px-4 pb-8">
		<div class="w-full max-w-sm">
			<div class="mb-5 text-center">
				<h1 class="text-xl font-bold text-gray-900">엠마오로 가는 두 제자</h1>
				<p class="mt-1 text-sm font-medium text-gray-500">
					서림교회 마르투스 일대일 교육 동행일기
				</p>
				<p class="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed text-gray-400 italic">
					"그들이 서로 말하되 길에서 우리에게 말씀하시고 우리에게 성경을 풀어 주실 때에 우리 속에서
					마음이 뜨겁지 아니하더냐 하고" (눅24:32)
				</p>
			</div>

			{#if !role}
				<!-- Role Selection -->
				<div class="space-y-3">
					<button
						onclick={() => selectRole('mentor')}
						class="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
					>
						<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
							<span class="text-lg">🧑‍🏫</span>
						</div>
						<div class="text-left">
							<p class="text-sm font-bold text-gray-900">양육자로 로그인</p>
							<p class="text-xs text-gray-400">동반자를 양육하는 분</p>
						</div>
					</button>

					<button
						onclick={() => selectRole('companion')}
						class="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-purple-300 hover:shadow-md"
					>
						<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100">
							<span class="text-lg">🙋</span>
						</div>
						<div class="text-left">
							<p class="text-sm font-bold text-gray-900">동반자로 로그인</p>
							<p class="text-xs text-gray-400">양육자와 함께 동행하는 분</p>
						</div>
					</button>
				</div>
			{:else}
				<!-- Login Form -->
				<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
					<div class="mb-4 flex items-center justify-between">
						<button
							onclick={() => (selectedRole = null)}
							class="text-xs text-gray-400 hover:text-gray-600"
						>
							← 역할 다시 선택
						</button>
						<span
							class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold {isMentor
								? 'bg-blue-100 text-blue-700'
								: 'bg-purple-100 text-purple-700'}"
						>
							{isMentor ? '양육자' : '동반자'}
						</span>
					</div>

					<form onsubmit={handleSubmit} class="space-y-4">
						<div>
							<label for="myName" class="mb-1.5 block text-xs font-medium text-gray-500">
								{isMentor ? '양육자 이름 (본인)' : '동반자 이름 (본인)'}
							</label>
							<input
								id="myName"
								type="text"
								bind:value={myName}
								placeholder="이름을 입력하세요"
								class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								required
							/>
						</div>

						<div>
							<label for="partnerName" class="mb-1.5 block text-xs font-medium text-gray-500">
								{isMentor ? '동반자 이름' : '양육자 이름'}
							</label>
							<input
								id="partnerName"
								type="text"
								bind:value={partnerName}
								placeholder="{isMentor ? '동반자' : '양육자'} 이름을 입력하세요"
								class="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={!myName.trim() || !partnerName.trim() || submitting}
							class="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-40 {isMentor
								? 'bg-blue-500'
								: 'bg-purple-500'}"
						>
							시작하기
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>
</div>
