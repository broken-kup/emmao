import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface UserInfo {
	name: string;
	role: 'mentor' | 'companion';
	mentorName: string;
	companionName: string;
	pairKey: string;
}

function createUserStore() {
	let initial: UserInfo | null = null;
	if (browser) {
		const stored = localStorage.getItem('emmao_user');
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				if (parsed.pairKey) {
					initial = parsed;
				}
			} catch {
				initial = null;
			}
		}
	}

	const { subscribe, set } = writable<UserInfo | null>(initial);

	return {
		subscribe,
		login(info: UserInfo) {
			if (browser) {
				localStorage.setItem('emmao_user', JSON.stringify(info));
			}
			set(info);
		},
		logout() {
			if (browser) {
				localStorage.removeItem('emmao_user');
			}
			set(null);
		}
	};
}

export const user = createUserStore();
