import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface UserInfo {
	name: string;
	role: 'mentor' | 'companion';
}

function createUserStore() {
	let initial: UserInfo | null = null;
	if (browser) {
		const stored = localStorage.getItem('emmao_user');
		if (stored) {
			try {
				initial = JSON.parse(stored);
			} catch {
				initial = null;
			}
		}
	}

	const { subscribe, set, update } = writable<UserInfo | null>(initial);

	return {
		subscribe,
		login(info: UserInfo) {
			if (browser) {
				localStorage.setItem('emmao_user', JSON.stringify(info));
				document.cookie = `emmao_user=${encodeURIComponent(JSON.stringify(info))}; path=/; max-age=31536000`;
			}
			set(info);
		},
		logout() {
			if (browser) {
				localStorage.removeItem('emmao_user');
				document.cookie = 'emmao_user=; path=/; max-age=0';
			}
			set(null);
		}
	};
}

export const user = createUserStore();
