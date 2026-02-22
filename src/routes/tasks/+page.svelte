<script lang="ts">
	import { onMount } from 'svelte';
	import { Loader2, BookOpen, BookMarked, BookOpenCheck, Mic, PenLine } from 'lucide-svelte';
	import { user } from '$lib/stores/user';

	interface TaskCheck {
		id: number;
		week: number;
		taskType: string;
		completed: boolean;
	}

	const TASK_TYPES = [
		{ key: 'textbook', label: '교재예습', icon: BookOpen },
		{ key: 'memorization', label: '성경암송', icon: BookMarked },
		{ key: 'reading', label: '성경읽기', icon: BookOpenCheck },
		{ key: 'sermon', label: '설교기록', icon: Mic },
		{ key: 'qt', label: 'QT', icon: PenLine }
	];

	const TASK_DESCRIPTIONS = [
		{ label: '교재예습', desc: '일대일 교재에 적혀있는 성경구절 적고 질문에 대한 답 적어오기' },
		{ label: '성경암송', desc: '주차별 성경암송하기' },
		{ label: '성경읽기', desc: '매일 시편 한편 + 잠언 한 장 읽기' },
		{ label: '설교기록', desc: '주일 설교 듣고 마음에 울리는 내용 및 질문 적기' },
		{ label: 'QT', desc: '매일 QT 후에 마음에 울리는 내용 올리기' }
	];

	let tasks = $state<TaskCheck[]>([]);
	let loading = $state(true);

	const pairKey = $derived($user?.pairKey || '');

	function getTask(week: number, taskType: string) {
		return tasks.find((t) => t.week === week && t.taskType === taskType);
	}

	async function toggleTask(week: number, taskType: string) {
		const current = getTask(week, taskType);
		const newCompleted = !(current?.completed ?? false);

		if (current) {
			current.completed = newCompleted;
		} else {
			tasks.push({ id: 0, week, taskType, completed: newCompleted });
		}

		const res = await fetch('/api/tasks', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pairKey, week, taskType, completed: newCompleted })
		});
		const saved = await res.json();
		const idx = tasks.findIndex((t) => t.week === week && t.taskType === taskType);
		if (idx >= 0) tasks[idx] = saved;
	}

	onMount(async () => {
		const res = await fetch(`/api/tasks?pairKey=${encodeURIComponent(pairKey)}`);
		tasks = await res.json();
		loading = false;
	});
</script>

<div class="mx-auto max-w-lg p-4">
	<h2 class="mb-4 text-base font-bold">일대일교육 과제점검</h2>

	<div class="mb-6 space-y-2">
		{#each TASK_DESCRIPTIONS as item}
			<div class="rounded-lg border border-gray-100 bg-white p-3">
				<p class="text-sm font-semibold text-gray-800">{item.label}</p>
				<p class="mt-0.5 text-xs text-gray-500">{item.desc}</p>
			</div>
		{/each}
	</div>

	<h3 class="mb-3 text-sm font-bold text-gray-600">15주 현황표</h3>

	{#if loading}
		<div class="flex justify-center py-10">
			<Loader2 size={24} class="animate-spin text-gray-400" />
		</div>
	{:else}
		<div class="overflow-x-auto rounded-xl border border-gray-200">
			<table class="w-full text-center text-xs">
				<thead>
					<tr class="bg-gray-50">
						<th class="sticky left-0 bg-gray-50 px-2 py-2.5 text-gray-500">주차</th>
						{#each TASK_TYPES as t}
							<th class="px-1.5 py-2.5">
								<div class="flex flex-col items-center gap-0.5">
									<t.icon size={14} class="text-gray-400" />
									<span class="text-[10px] font-medium text-gray-500">{t.label}</span>
								</div>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Array.from({ length: 15 }, (_, i) => i + 1) as week}
						<tr class="border-t border-gray-100 {week % 2 === 0 ? 'bg-gray-50/50' : ''}">
							<td class="sticky left-0 bg-white px-2 py-2 font-medium text-gray-700 {week % 2 === 0 ? '!bg-gray-50/50' : ''}">
								{week}주
							</td>
							{#each TASK_TYPES as t}
								{@const task = getTask(week, t.key)}
								<td class="px-1.5 py-2">
									<button
										onclick={() => toggleTask(week, t.key)}
										class="mx-auto flex h-7 w-7 items-center justify-center rounded-md transition {task?.completed ? 'bg-green-500 text-white' : 'border border-gray-200 bg-white text-transparent hover:border-gray-300'}"
									>
										{#if task?.completed}
											✓
										{/if}
									</button>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
