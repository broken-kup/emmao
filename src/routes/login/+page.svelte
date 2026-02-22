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

	async function handleSubmit() {
		if (!role || !myName.trim() || !partnerName.trim() || submitting) return;
		submitting = true;

		const mentorName = isMentor ? myName.trim() : partnerName.trim();
		const companionName = isMentor ? partnerName.trim() : myName.trim();
		const pairKey = `${mentorName}::${companionName}`;

		try {
			const res = await fetch(`/api/pairs?pairKey=${encodeURIComponent(pairKey)}`);
			const pairs = await res.json();

			if (!pairs || pairs.length === 0) {
				alert('등록되지 않은 페어입니다.\n관리자에게 문의해주세요.');
				submitting = false;
				return;
			}

			user.login({ name: myName.trim(), role, mentorName, companionName, pairKey });
			goto('/');
		} catch {
			alert('서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
			submitting = false;
		}
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
						class="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
					>
						<p class="text-sm font-bold text-gray-900">양육자로 로그인</p>
						<p class="mt-0.5 text-xs text-gray-400">동반자를 양육하는 분</p>
					</button>

					<button
						onclick={() => selectRole('companion')}
						class="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-green-300 hover:shadow-md"
					>
						<p class="text-sm font-bold text-gray-900">동반자로 로그인</p>
						<p class="mt-0.5 text-xs text-gray-400">양육자와 함께 동행하는 분</p>
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
							: 'bg-green-100 text-green-700'}"
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
							: 'bg-green-500'}"
						>
							시작하기
						</button>
					</form>
				</div>
			{/if}
		</div>
	</div>

	<!-- Footer -->
	<footer class="border-t border-gray-100 bg-white px-4 py-6">
		<div class="mx-auto flex max-w-sm flex-col">
			<div class="flex flex-col gap-5">
				<div>
					<a class="flex items-center" href="https://flowbite-svelte.com">
						<img src="/logo_blue.svg" class="me-2 h-5" alt="Broken Kup Logo" />
						<span class="text-sm font-semibold whitespace-nowrap text-gray-800">Broken Kup</span>
					</a>
					<p class="mt-2 text-[11px] leading-relaxed text-gray-400">
						Broken Kup이란 하나님을 믿기로 결단했을 때, 깨어져버린 Cup과 같은 저를
						하나님께서 온 세상을 담는 잔으로 사용하시겠다고 말씀해주신 경험에서 비롯된
						K(kang)를 형상화한 브랜드 입니다.
					</p>
				</div>
				<div class="flex gap-10">
					<div>
						<h2 class="mb-2 text-[11px] font-semibold uppercase text-gray-700">Connection</h2>
						<ul class="space-y-1.5 text-[11px] text-gray-400">
							<li>
								<a href="mailto:rkdgygud@gmail.com" class="hover:underline" target="_blank" rel="noopener noreferrer">E-Mail</a>
							</li>
							<li>
								<a href="https://www.instagram.com/k______up/" class="hover:underline" target="_blank" rel="noopener noreferrer">Instagram</a>
							</li>
						</ul>
					</div>
					<div>
						<h2 class="mb-2 text-[11px] font-semibold uppercase text-gray-700">Site</h2>
						<ul class="space-y-1.5 text-[11px] text-gray-400">
							<li>
								<a href="https://board-game-six.vercel.app" class="hover:underline" target="_blank" rel="noopener noreferrer">보드게임 도감</a>
							</li>
							<li>
								<a href="https://ajae-pedia-131813479911.us-west1.run.app" class="hover:underline" target="_blank" rel="noopener noreferrer">아재 백과사전</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	</footer>
</div>
