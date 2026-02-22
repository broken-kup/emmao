<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Trash2, Loader2, Users } from 'lucide-svelte';

	interface Pair {
		id: number;
		mentorName: string;
		companionName: string;
		pairKey: string;
		createdAt: string;
	}

	let pairsList = $state<Pair[]>([]);
	let loading = $state(true);
	let mentorInput = $state('');
	let companionInput = $state('');
	let saving = $state(false);
	let errorMsg = $state('');

	async function loadPairs() {
		const res = await fetch('/api/pairs');
		pairsList = await res.json();
		loading = false;
	}

	async function addPair() {
		if (!mentorInput.trim() || !companionInput.trim() || saving) return;
		saving = true;
		errorMsg = '';

		const res = await fetch('/api/pairs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				mentorName: mentorInput.trim(),
				companionName: companionInput.trim()
			})
		});

		if (!res.ok) {
			const data = await res.json();
			errorMsg = data.error || '등록에 실패했습니다';
		} else {
			mentorInput = '';
			companionInput = '';
			await loadPairs();
		}
		saving = false;
	}

	async function deletePair(id: number) {
		if (!confirm('이 페어를 삭제하시겠습니까?')) return;
		await fetch(`/api/pairs?id=${id}`, { method: 'DELETE' });
		await loadPairs();
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	onMount(loadPairs);
</script>

<div class="mx-auto min-h-screen max-w-lg bg-gray-50 p-4">
	<div class="mb-6 flex items-center gap-3">
		<div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900">
			<Users size={20} class="text-white" />
		</div>
		<div>
			<h1 class="text-lg font-bold text-gray-900">페어 관리</h1>
			<p class="text-xs text-gray-400">양육자 - 동반자 매핑 등록</p>
		</div>
	</div>

	<!-- Registration Form -->
	<div class="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
		<h2 class="mb-4 text-sm font-bold text-gray-700">새 페어 등록</h2>
		<div class="space-y-3">
			<div>
				<label for="mentor" class="mb-1 block text-xs font-medium text-gray-500">양육자 이름</label>
				<input
					id="mentor"
					type="text"
					bind:value={mentorInput}
					placeholder="양육자 이름"
					class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
				/>
			</div>
			<div>
				<label for="companion" class="mb-1 block text-xs font-medium text-gray-500">동반자 이름</label>
				<input
					id="companion"
					type="text"
					bind:value={companionInput}
					placeholder="동반자 이름"
					class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm transition focus:border-gray-500 focus:ring-2 focus:ring-gray-200 focus:outline-none"
				/>
			</div>

			{#if errorMsg}
				<p class="text-xs font-medium text-red-500">{errorMsg}</p>
			{/if}

			<button
				onclick={addPair}
				disabled={!mentorInput.trim() || !companionInput.trim() || saving}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-40"
			>
				{#if saving}
					<Loader2 size={16} class="animate-spin" />
				{:else}
					<Plus size={16} />
				{/if}
				페어 등록
			</button>
		</div>
	</div>

	<!-- Pairs List -->
	<div>
		<h2 class="mb-3 text-sm font-bold text-gray-700">등록된 페어 ({pairsList.length})</h2>

		{#if loading}
			<div class="flex justify-center py-10">
				<Loader2 size={24} class="animate-spin text-gray-400" />
			</div>
		{:else if pairsList.length === 0}
			<div class="rounded-2xl border border-dashed border-gray-200 py-10 text-center">
				<Users size={32} class="mx-auto text-gray-300" />
				<p class="mt-2 text-sm text-gray-400">등록된 페어가 없습니다</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each pairsList as pair (pair.id)}
					<div class="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">양육자</span>
								<span class="text-sm font-medium text-gray-800">{pair.mentorName}</span>
								<span class="text-gray-300">·</span>
								<span class="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">동반자</span>
								<span class="text-sm font-medium text-gray-800">{pair.companionName}</span>
							</div>
							<p class="mt-1 text-[10px] text-gray-400">{formatDate(pair.createdAt)}</p>
						</div>
						<button
							onclick={() => deletePair(pair.id)}
							class="shrink-0 rounded-lg p-2 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
						>
							<Trash2 size={16} />
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
