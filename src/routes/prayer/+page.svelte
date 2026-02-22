<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Save, Trash2, Loader2 } from 'lucide-svelte';
	import { user } from '$lib/stores/user';

	interface PrayerTopic {
		id: number;
		category: string;
		slotIndex: number;
		content: string;
		updatedAt: string;
	}

	let topics = $state<PrayerTopic[]>([]);
	let loading = $state(true);

	let mentorTopics = $derived(
		[1, 2, 3].map((i) => topics.find((t) => t.category === 'mentor' && t.slotIndex === i))
	);
	let companionTopics = $derived(
		[1, 2, 3].map((i) => topics.find((t) => t.category === 'companion' && t.slotIndex === i))
	);
	let weeklyTopics = $derived(
		topics.filter((t) => t.category === 'weekly').sort((a, b) => a.slotIndex - b.slotIndex)
	);

	let editingMentor = $state(['', '', '']);
	let editingCompanion = $state(['', '', '']);
	let newWeeklyWeek = $state(1);
	let newWeeklyContent = $state('');
	let saving = $state(false);

	const pairKey = $derived($user?.pairKey || '');
	const mentorName = $derived($user?.mentorName || '양육자');
	const companionName = $derived($user?.companionName || '동반자');

	async function loadTopics() {
		const res = await fetch(`/api/prayer?pairKey=${encodeURIComponent(pairKey)}`);
		topics = await res.json();

		for (let i = 0; i < 3; i++) {
			editingMentor[i] = mentorTopics[i]?.content || '';
			editingCompanion[i] = companionTopics[i]?.content || '';
		}
		loading = false;
	}

	async function saveFixed(category: string, index: number, content: string) {
		if (!content.trim()) return;
		saving = true;
		await fetch('/api/prayer', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pairKey, category, slotIndex: index, content: content.trim() })
		});
		await loadTopics();
		saving = false;
	}

	async function addWeekly() {
		if (!newWeeklyContent.trim()) return;
		saving = true;
		await fetch('/api/prayer', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				pairKey,
				category: 'weekly',
				slotIndex: newWeeklyWeek,
				content: newWeeklyContent.trim()
			})
		});
		newWeeklyContent = '';
		await loadTopics();
		saving = false;
	}

	async function deleteWeekly(id: number) {
		if (!confirm('삭제하시겠습니까?')) return;
		await fetch(`/api/prayer?id=${id}`, { method: 'DELETE' });
		await loadTopics();
	}

	onMount(loadTopics);
</script>

<div class="mx-auto max-w-lg p-4">
	{#if loading}
		<div class="flex justify-center py-20">
			<Loader2 size={24} class="animate-spin text-gray-400" />
		</div>
	{:else}
		<section class="mb-6">
			<h2 class="mb-3 text-base font-bold">{mentorName} 기도제목</h2>
			<div class="space-y-2">
				{#each [0, 1, 2] as i}
					<div class="flex items-start gap-2">
						<span class="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
							{i + 1}
						</span>
						<textarea
							bind:value={editingMentor[i]}
							placeholder="기도제목을 입력하세요"
							rows={2}
							class="flex-1 resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
						></textarea>
						<button
							onclick={() => saveFixed('mentor', i + 1, editingMentor[i])}
							disabled={saving}
							class="mt-1.5 shrink-0 rounded-lg bg-blue-500 p-2 text-white transition hover:bg-blue-600 disabled:opacity-50"
						>
							<Save size={14} />
						</button>
					</div>
				{/each}
			</div>
		</section>

		<section class="mb-6">
			<h2 class="mb-3 text-base font-bold">{companionName} 기도제목</h2>
			<div class="space-y-2">
				{#each [0, 1, 2] as i}
					<div class="flex items-start gap-2">
						<span class="mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
							{i + 1}
						</span>
						<textarea
							bind:value={editingCompanion[i]}
							placeholder="기도제목을 입력하세요"
							rows={2}
							class="flex-1 resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-purple-400 focus:outline-none"
						></textarea>
						<button
							onclick={() => saveFixed('companion', i + 1, editingCompanion[i])}
							disabled={saving}
							class="mt-1.5 shrink-0 rounded-lg bg-purple-500 p-2 text-white transition hover:bg-purple-600 disabled:opacity-50"
						>
							<Save size={14} />
						</button>
					</div>
				{/each}
			</div>
		</section>

		<section>
			<h2 class="mb-3 text-base font-bold">주차별 기도제목</h2>

			<div class="mb-4 rounded-xl border border-gray-200 p-3">
				<div class="mb-2 flex items-center gap-2">
					<select
						bind:value={newWeeklyWeek}
						class="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
					>
						{#each Array.from({ length: 15 }, (_, i) => i + 1) as w}
							<option value={w}>{w}주차</option>
						{/each}
					</select>
					<button
						onclick={addWeekly}
						disabled={!newWeeklyContent.trim() || saving}
						class="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
					>
						<Plus size={14} />
						추가
					</button>
				</div>
				<textarea
					bind:value={newWeeklyContent}
					placeholder="주차별 기도제목을 입력하세요"
					rows={2}
					class="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-gray-400 focus:outline-none"
				></textarea>
			</div>

			{#if weeklyTopics.length === 0}
				<p class="py-8 text-center text-sm text-gray-400">등록된 주차별 기도제목이 없습니다</p>
			{:else}
				<div class="space-y-2">
					{#each weeklyTopics as topic}
						<div class="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
							<span class="mt-0.5 shrink-0 rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
								{topic.slotIndex}주차
							</span>
							<p class="flex-1 text-sm leading-relaxed whitespace-pre-wrap">{topic.content}</p>
							<button
								onclick={() => deleteWeekly(topic.id)}
								class="shrink-0 p-1 text-gray-300 hover:text-red-500"
							>
								<Trash2 size={14} />
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{/if}
</div>
