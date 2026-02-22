<script lang="ts">
	import { goto } from '$app/navigation';
	import { user } from '$lib/stores/user';
	import { ImagePlus, FileText, ArrowLeft, Loader2 } from 'lucide-svelte';

	const CATEGORIES = [
		{ key: 'qt', label: 'QT', color: 'bg-green-100 text-green-700' },
		{ key: 'bible', label: '성경읽기', color: 'bg-amber-100 text-amber-700', textOnly: true },
		{ key: 'sermon', label: '설교기록', color: 'bg-blue-100 text-blue-700', textOnly: true },
		{ key: 'free', label: '자유', color: 'bg-gray-100 text-gray-600' }
	];

	const TEMPLATES: Record<string, string> = {
		bible: '통독 구절 : \n시편 구절 : \n잠언 구절 : \n',
		sermon: '설교제목 : \n설교내용 : \n마음에서 울리는 묵상 : \n'
	};

	let selectedCategory = $state('qt');
	let activeTab = $state<'photo' | 'text'>('photo');
	let caption = $state('');
	let textContent = $state('');
	let selectedFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let submitting = $state(false);

	const isTextOnly = $derived(
		CATEGORIES.find((c) => c.key === selectedCategory)?.textOnly ?? false
	);

	function selectCategory(key: string) {
		selectedCategory = key;
		const cat = CATEGORIES.find((c) => c.key === key);
		if (cat?.textOnly) {
			activeTab = 'text';
			textContent = TEMPLATES[key] || '';
		} else {
			textContent = '';
		}
	}

	function handleFileSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		selectedFile = file;
		previewUrl = URL.createObjectURL(file);
	}

	async function uploadToR2(file: File): Promise<string> {
		const res = await fetch('/api/upload', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ fileName: file.name, contentType: file.type })
		});
		const { uploadUrl, key } = await res.json();

		await fetch(uploadUrl, {
			method: 'PUT',
			body: file,
			headers: { 'Content-Type': file.type }
		});

		return key;
	}

	async function handleSubmit() {
		if (!$user || submitting) return;

		submitting = true;
		try {
			let imageKey: string | null = null;

			if (activeTab === 'photo' && selectedFile) {
				imageKey = await uploadToR2(selectedFile);
			}

			await fetch('/api/posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pairKey: $user.pairKey,
					authorName: $user.name,
					category: selectedCategory,
					type: activeTab,
					content: activeTab === 'text' ? textContent : null,
					imageKey,
					caption: caption || null
				})
			});

			goto('/');
		} catch (e) {
			console.error('Failed to create post:', e);
			alert('게시물 등록에 실패했습니다.');
		} finally {
			submitting = false;
		}
	}

	function canSubmit() {
		if (activeTab === 'photo') return !!selectedFile;
		return !!textContent.trim();
	}
</script>

<div class="mx-auto max-w-lg">
	<div class="flex items-center justify-between border-b border-gray-100 px-4 py-3">
		<a href="/" class="p-1 text-gray-600 hover:text-black">
			<ArrowLeft size={22} />
		</a>
		<h2 class="text-sm font-bold">새 게시물</h2>
		<button
			onclick={handleSubmit}
			disabled={!canSubmit() || submitting}
			class="text-sm font-semibold text-blue-500 disabled:opacity-40"
		>
			{#if submitting}
				<Loader2 size={18} class="animate-spin" />
			{:else}
				공유
			{/if}
		</button>
	</div>

	<!-- Category Selection -->
	<div class="flex gap-2 border-b border-gray-100 px-4 py-3">
		{#each CATEGORIES as cat}
			<button
				onclick={() => selectCategory(cat.key)}
				class="rounded-full px-3 py-1.5 text-xs font-semibold transition {selectedCategory === cat.key
					? cat.color + ' ring-2 ring-offset-1 ring-gray-300'
					: 'bg-gray-50 text-gray-400'}"
			>
				{cat.label}
			</button>
		{/each}
	</div>

	<!-- Tab (hidden for text-only categories) -->
	{#if !isTextOnly}
		<div class="flex border-b border-gray-100">
			<button
				onclick={() => (activeTab = 'photo')}
				class="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition {activeTab === 'photo' ? 'border-b-2 border-black text-black' : 'text-gray-400'}"
			>
				<ImagePlus size={18} />
				사진 게시물
			</button>
			<button
				onclick={() => (activeTab = 'text')}
				class="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition {activeTab === 'text' ? 'border-b-2 border-black text-black' : 'text-gray-400'}"
			>
				<FileText size={18} />
				글 게시물
			</button>
		</div>
	{:else}
		<div class="flex items-center gap-2 border-b border-gray-100 px-4 py-2.5">
			<FileText size={16} class="text-gray-400" />
			<span class="text-xs text-gray-500">글 게시물만 작성 가능한 카테고리입니다</span>
		</div>
	{/if}

	<!-- Content -->
	<div class="p-4">
		{#if activeTab === 'photo' && !isTextOnly}
			{#if previewUrl}
				<div class="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-gray-50">
					<img src={previewUrl} alt="미리보기" class="h-full w-full object-cover" />
					<button
						onclick={() => { selectedFile = null; previewUrl = null; }}
						class="absolute top-2 right-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white"
					>
						변경
					</button>
				</div>
			{:else}
				<label
					class="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-gray-400 hover:text-gray-500"
				>
					<ImagePlus size={48} strokeWidth={1} />
					<span class="mt-2 text-sm">사진을 선택하세요</span>
					<input
						type="file"
						accept="image/*"
						onchange={handleFileSelect}
						class="hidden"
					/>
				</label>
			{/if}

			<textarea
				bind:value={caption}
				placeholder="캡션을 입력하세요..."
				rows={3}
				class="mt-3 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-gray-400 focus:outline-none"
			></textarea>
		{:else}
			<textarea
				bind:value={textContent}
				placeholder="나누고 싶은 이야기를 적어주세요..."
				rows={12}
				class="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm leading-relaxed focus:border-gray-400 focus:outline-none"
			></textarea>

			<textarea
				bind:value={caption}
				placeholder="캡션을 입력하세요... (선택)"
				rows={2}
				class="mt-3 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-gray-400 focus:outline-none"
			></textarea>
		{/if}
	</div>
</div>
