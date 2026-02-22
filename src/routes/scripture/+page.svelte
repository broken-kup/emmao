<script lang="ts">
	import { Eye, EyeOff, Check, X, RotateCcw } from 'lucide-svelte';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let verses = $derived(data.verses);

	let selectedWeek = $state(1);
	let showVerse = $state(true);
	let userInput1 = $state('');
	let userInput2 = $state('');
	let result1 = $state<'correct' | 'wrong' | null>(null);
	let result2 = $state<'correct' | 'wrong' | null>(null);

	let currentVerse = $derived(verses.find((v) => v.week === selectedWeek));

	function getWeekLabel(week: number) {
		if (week === 1) return 'QT 후 1주';
		return `${week}주`;
	}

	function normalize(text: string) {
		return text.replace(/\s+/g, '').replace(/[.,!?;:'"]/g, '');
	}

	function checkVerse(inputNum: 1 | 2) {
		if (!currentVerse) return;
		if (inputNum === 1) {
			const match = normalize(userInput1) === normalize(currentVerse.verse1Text);
			result1 = match ? 'correct' : 'wrong';
		} else {
			const match = normalize(userInput2) === normalize(currentVerse.verse2Text);
			result2 = match ? 'correct' : 'wrong';
		}
	}

	function reset() {
		userInput1 = '';
		userInput2 = '';
		result1 = null;
		result2 = null;
		showVerse = true;
	}

	$effect(() => {
		selectedWeek;
		reset();
	});
</script>

<div class="mx-auto max-w-lg p-4">
	<h2 class="mb-4 text-base font-bold">성구암송</h2>

	<!-- Week Selector -->
	<select
		bind:value={selectedWeek}
		class="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium focus:border-gray-400 focus:outline-none"
	>
		{#each verses as v}
			<option value={v.week}>{getWeekLabel(v.week)} - {v.topic}</option>
		{/each}
	</select>

	{#if currentVerse}
		<!-- Topic -->
		<div class="mb-4 rounded-xl bg-blue-50 p-4 text-center">
			<p class="text-xs text-blue-500">{getWeekLabel(currentVerse.week)}</p>
			<p class="mt-1 text-lg font-bold text-blue-800">{currentVerse.topic}</p>
		</div>

		<!-- Toggle Button -->
		<div class="mb-4 flex justify-center gap-2">
			<button
				onclick={() => (showVerse = true)}
				class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition {showVerse ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}"
			>
				<Eye size={16} />
				암송구절 보기
			</button>
			<button
				onclick={() => (showVerse = false)}
				class="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition {!showVerse ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}"
			>
				<EyeOff size={16} />
				숨기기
			</button>
		</div>

		<!-- Verse 1 -->
		<div class="mb-4 rounded-xl border border-gray-200 bg-white p-4">
			<p class="mb-2 text-sm font-bold text-blue-600">{currentVerse.verse1Ref}</p>
			{#if showVerse}
				<p class="text-sm leading-relaxed text-gray-700">{currentVerse.verse1Text}</p>
			{:else}
				<p class="text-sm italic text-gray-300">구절이 숨겨져 있습니다</p>
			{/if}

			<div class="mt-3 border-t border-gray-100 pt-3">
				<textarea
					bind:value={userInput1}
					placeholder="암송 구절을 입력하세요..."
					rows={3}
					class="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-blue-400 focus:outline-none"
				></textarea>
				<div class="mt-2 flex items-center gap-2">
					<button
						onclick={() => checkVerse(1)}
						disabled={!userInput1.trim()}
						class="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-40"
					>
						<Check size={14} />
						확인
					</button>
					{#if result1 === 'correct'}
						<span class="flex items-center gap-1 text-sm font-semibold text-green-600">
							<Check size={16} /> 정확합니다!
						</span>
					{:else if result1 === 'wrong'}
						<span class="flex items-center gap-1 text-sm font-semibold text-red-500">
							<X size={16} /> 다시 확인해주세요
						</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Verse 2 -->
		<div class="mb-4 rounded-xl border border-gray-200 bg-white p-4">
			<p class="mb-2 text-sm font-bold text-purple-600">{currentVerse.verse2Ref}</p>
			{#if showVerse}
				<p class="text-sm leading-relaxed text-gray-700">{currentVerse.verse2Text}</p>
			{:else}
				<p class="text-sm italic text-gray-300">구절이 숨겨져 있습니다</p>
			{/if}

			<div class="mt-3 border-t border-gray-100 pt-3">
				<textarea
					bind:value={userInput2}
					placeholder="암송 구절을 입력하세요..."
					rows={3}
					class="w-full resize-none rounded-lg border border-gray-200 p-2.5 text-sm focus:border-purple-400 focus:outline-none"
				></textarea>
				<div class="mt-2 flex items-center gap-2">
					<button
						onclick={() => checkVerse(2)}
						disabled={!userInput2.trim()}
						class="flex items-center gap-1 rounded-lg bg-purple-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-600 disabled:opacity-40"
					>
						<Check size={14} />
						확인
					</button>
					{#if result2 === 'correct'}
						<span class="flex items-center gap-1 text-sm font-semibold text-green-600">
							<Check size={16} /> 정확합니다!
						</span>
					{:else if result2 === 'wrong'}
						<span class="flex items-center gap-1 text-sm font-semibold text-red-500">
							<X size={16} /> 다시 확인해주세요
						</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Reset -->
		<div class="flex justify-center">
			<button
				onclick={reset}
				class="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
			>
				<RotateCcw size={14} />
				초기화
			</button>
		</div>
	{/if}
</div>
