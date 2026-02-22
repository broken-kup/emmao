<script lang="ts">
	import { user } from '$lib/stores/user';
	import { Send, Trash2 } from 'lucide-svelte';
	import { onMount } from 'svelte';

	interface Comment {
		id: number;
		postId: number;
		authorName: string;
		content: string;
		createdAt: string;
	}

	let { postId }: { postId: number } = $props();

	let comments = $state<Comment[]>([]);
	let newComment = $state('');
	let loading = $state(false);

	async function loadComments() {
		const res = await fetch(`/api/comments?postId=${postId}`);
		comments = await res.json();
	}

	async function addComment() {
		if (!newComment.trim() || !$user) return;
		loading = true;
		await fetch('/api/comments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				postId,
				authorName: $user.name,
				content: newComment.trim()
			})
		});
		newComment = '';
		await loadComments();
		loading = false;
	}

	async function deleteComment(id: number) {
		await fetch(`/api/comments?id=${id}`, { method: 'DELETE' });
		await loadComments();
	}

	function formatTime(dateStr: string) {
		const d = new Date(dateStr);
		const diff = Date.now() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return '방금 전';
		if (mins < 60) return `${mins}분 전`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}시간 전`;
		const days = Math.floor(hours / 24);
		return `${days}일 전`;
	}

	onMount(loadComments);
</script>

<div class="border-t border-gray-100 px-4 py-3">
	{#each comments as comment}
		<div class="mb-2 flex items-start gap-2">
			<div class="flex-1 text-sm">
				<span class="font-semibold">{comment.authorName}</span>
				<span class="ml-1 text-gray-800">{comment.content}</span>
				<span class="ml-2 text-xs text-gray-400">{formatTime(comment.createdAt)}</span>
			</div>
			{#if $user && comment.authorName === $user.name}
				<button
					onclick={() => deleteComment(comment.id)}
					class="shrink-0 p-1 text-gray-300 hover:text-red-500"
				>
					<Trash2 size={12} />
				</button>
			{/if}
		</div>
	{/each}

	<div class="mt-2 flex items-center gap-2">
		<input
			type="text"
			bind:value={newComment}
			placeholder="댓글 달기..."
			class="flex-1 rounded-full border border-gray-200 px-3 py-1.5 text-sm focus:border-gray-400 focus:outline-none"
			onkeydown={(e) => e.key === 'Enter' && addComment()}
		/>
		<button
			onclick={addComment}
			disabled={!newComment.trim() || loading}
			class="text-blue-500 disabled:opacity-30"
		>
			<Send size={18} />
		</button>
	</div>
</div>
