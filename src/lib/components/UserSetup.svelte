<script lang="ts">
	import { user } from '$lib/stores/user';

	let name = $state('');
	let role = $state<'mentor' | 'companion'>('companion');

	function handleSubmit() {
		if (!name.trim()) return;
		user.login({ name: name.trim(), role });
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
	<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
		<h2 class="mb-1 text-center text-xl font-bold">엠마오로 가는 두 제자</h2>
		<p class="mb-6 text-center text-sm text-gray-500">사용자 정보를 입력해주세요</p>

		<form onsubmit={handleSubmit} class="space-y-4">
			<div>
				<label for="name" class="mb-1 block text-sm font-medium text-gray-700">이름</label>
				<input
					id="name"
					type="text"
					bind:value={name}
					placeholder="이름을 입력하세요"
					class="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					required
				/>
			</div>

			<div>
				<span class="mb-2 block text-sm font-medium text-gray-700">역할</span>
				<div class="grid grid-cols-2 gap-2">
					<button
						type="button"
						onclick={() => (role = 'mentor')}
						class="rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition {role === 'mentor' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						양육자
					</button>
					<button
						type="button"
						onclick={() => (role = 'companion')}
						class="rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition {role === 'companion' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}"
					>
						동반자
					</button>
				</div>
			</div>

			<button
				type="submit"
				disabled={!name.trim()}
				class="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-40"
			>
				시작하기
			</button>
		</form>
	</div>
</div>
