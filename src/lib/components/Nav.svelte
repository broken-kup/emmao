<script lang="ts">
	import { page } from '$app/state';
	import { BookOpen, HandHeart, BookMarked, ClipboardCheck } from 'lucide-svelte';

	const menus = [
		{ href: '/', label: '동행기록', icon: BookOpen },
		{ href: '/prayer', label: '기도제목', icon: HandHeart },
		{ href: '/scripture', label: '성구암송', icon: BookMarked },
		{ href: '/tasks', label: '과제점검', icon: ClipboardCheck }
	];

	function isActive(href: string) {
		if (href === '/') return page.url.pathname === '/';
		return page.url.pathname.startsWith(href);
	}
</script>

<nav class="fixed right-0 bottom-0 left-0 z-40 border-t border-[var(--color-border)] bg-white">
	<div class="flex h-14 items-center justify-around">
		{#each menus as menu}
			<a
				href={menu.href}
				class="flex flex-col items-center gap-0.5 px-3 py-1 transition {isActive(menu.href) ? 'text-black' : 'text-gray-400 hover:text-gray-600'}"
			>
				<menu.icon size={22} strokeWidth={isActive(menu.href) ? 2.5 : 1.8} />
				<span class="text-[10px] font-medium">{menu.label}</span>
			</a>
		{/each}
	</div>
</nav>
