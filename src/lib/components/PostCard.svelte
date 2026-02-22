<script lang="ts">
	import { user } from '$lib/stores/user';
	import { Heart, Trash2 } from 'lucide-svelte';
	import CommentSection from './CommentSection.svelte';
	import { env } from '$env/dynamic/public';

	interface Post {
		id: number;
		authorName: string;
		category: string | null;
		type: string;
		content: string | null;
		imageKey: string | null;
		caption: string | null;
		createdAt: string;
		likeCount: number;
		commentCount: number;
	}

	const CATEGORY_STYLES: Record<string, { label: string; color: string }> = {
		qt: { label: 'QT', color: 'bg-green-100 text-green-700' },
		bible: { label: '성경읽기', color: 'bg-amber-100 text-amber-700' },
		sermon: { label: '설교기록', color: 'bg-blue-100 text-blue-700' },
		free: { label: '자유', color: 'bg-gray-100 text-gray-600' }
	};

	let { post, ondelete }: { post: Post; ondelete: (id: number) => void } = $props();

	let liked = $state(false);
	let likeCount = $state(0);
	let likeLoading = $state(false);

	$effect(() => {
		likeCount = post.likeCount;
	});

	$effect(() => {
		if ($user) {
			fetch(`/api/likes?postId=${post.id}&userName=${encodeURIComponent($user.name)}`)
				.then((r) => r.json())
				.then((data) => {
					liked = data.userLiked;
					likeCount = data.count;
				});
		}
	});

	async function toggleLike() {
		if (!$user || likeLoading) return;
		likeLoading = true;
		const res = await fetch('/api/likes', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ postId: post.id, userName: $user.name })
		});
		const data = await res.json();
		liked = data.liked;
		likeCount += data.liked ? 1 : -1;
		likeLoading = false;
	}

	async function handleDelete() {
		if (!confirm('게시물을 삭제하시겠습니까?')) return;
		await fetch(`/api/posts?id=${post.id}`, { method: 'DELETE' });
		ondelete(post.id);
	}

	function formatDate(dateStr: string) {
		const d = new Date(dateStr);
		return d.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getImageUrl(key: string) {
		return `${env.PUBLIC_R2_URL || ''}/${key}`;
	}

	const catStyle = $derived(post.category ? CATEGORY_STYLES[post.category] : null);
</script>

<article class="mb-3 border-b border-gray-100 bg-white">
	<div class="flex items-center justify-between px-4 py-3">
		<div class="flex items-center gap-2">
			<div class="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-green-500 text-xs font-bold text-white">
				{post.authorName.charAt(0)}
			</div>
			<div>
				<div class="flex items-center gap-1.5">
					<p class="text-sm font-semibold">{post.authorName}</p>
					{#if catStyle}
						<span class="rounded-full px-2 py-0.5 text-[10px] font-semibold {catStyle.color}">
							{catStyle.label}
						</span>
					{/if}
				</div>
				<p class="text-[10px] text-gray-400">{formatDate(post.createdAt)}</p>
			</div>
		</div>
		<button
			onclick={handleDelete}
			class="p-1.5 text-gray-400 hover:text-red-500 transition"
			aria-label="삭제"
		>
			<Trash2 size={16} />
		</button>
	</div>

	{#if post.type === 'photo' && post.imageKey}
		<div class="aspect-square w-full bg-gray-50">
			<img
				src={getImageUrl(post.imageKey)}
				alt="게시물 이미지"
				class="h-full w-full object-cover"
			/>
		</div>
	{:else if post.type === 'text' && post.content}
		<div class="min-h-32 bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-6">
			<p class="text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
		</div>
	{/if}

	<div class="px-4 pt-2">
		<button
			onclick={toggleLike}
			class="flex items-center gap-1.5 transition"
			class:text-red-500={liked}
			class:text-gray-600={!liked}
		>
			<Heart size={22} fill={liked ? 'currentColor' : 'none'} strokeWidth={2} />
		</button>
		{#if likeCount > 0}
			<p class="mt-1 text-xs font-semibold">좋아요 {likeCount}개</p>
		{/if}
	</div>

	{#if post.caption}
		<div class="px-4 pt-1 pb-2">
			<p class="text-sm">
				<span class="font-semibold">{post.authorName}</span>
				<span class="ml-1">{post.caption}</span>
			</p>
		</div>
	{/if}

	<CommentSection postId={post.id} />
</article>
