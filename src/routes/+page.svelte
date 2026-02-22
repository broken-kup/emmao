<script lang="ts">
	import PostCard from '$lib/components/PostCard.svelte';
	import { Loader2 } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { user } from '$lib/stores/user';

	interface Post {
		id: number;
		authorName: string;
		type: string;
		content: string | null;
		imageKey: string | null;
		caption: string | null;
		createdAt: string;
		likeCount: number;
		commentCount: number;
	}

	let posts = $state<Post[]>([]);
	let loading = $state(true);
	let hasMore = $state(true);
	let loadingMore = $state(false);

	async function loadPosts(offset = 0) {
		const pairKey = $user?.pairKey || '';
		const res = await fetch(`/api/posts?limit=20&offset=${offset}&pairKey=${encodeURIComponent(pairKey)}`);
		const data: Post[] = await res.json();
		if (offset === 0) {
			posts = data;
		} else {
			posts = [...posts, ...data];
		}
		hasMore = data.length === 20;
		loading = false;
		loadingMore = false;
	}

	async function loadMore() {
		loadingMore = true;
		await loadPosts(posts.length);
	}

	function removePost(id: number) {
		posts = posts.filter((p) => p.id !== id);
	}

	onMount(() => {
		loadPosts();
	});
</script>

<div class="mx-auto max-w-lg">
	{#if loading}
		<div class="flex items-center justify-center py-20">
			<Loader2 size={24} class="animate-spin text-gray-400" />
		</div>
	{:else if posts.length === 0}
		<div class="flex flex-col items-center justify-center py-20 text-center">
			<p class="text-lg font-semibold text-gray-400">아직 게시물이 없습니다</p>
			<p class="mt-1 text-sm text-gray-300">+ 버튼을 눌러 첫 게시물을 등록해보세요</p>
		</div>
	{:else}
		{#each posts as post (post.id)}
			<PostCard {post} ondelete={removePost} />
		{/each}

		{#if hasMore}
			<div class="flex justify-center py-4">
				<button
					onclick={loadMore}
					disabled={loadingMore}
					class="rounded-full bg-gray-100 px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50"
				>
					{#if loadingMore}
						<Loader2 size={16} class="animate-spin" />
					{:else}
						더 보기
					{/if}
				</button>
			</div>
		{/if}
	{/if}
</div>
