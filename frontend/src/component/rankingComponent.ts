import dom from '../shared/dom.js';
import avatarComponent from './profile/avatarComponent.js';
import router from "../router.js";
import api from '../shared/api/api.js';

async function rankingComponent(): Promise<HTMLElement> {
    const container = dom.create(`
    <div class="overflow-x-auto mt-10 w-full rounded-lg">
        <table class="min-w-full text-lightText font-bold font-headline text-center text-[1.1rem] border-4 border-secondary">
            <thead class="bg-secondary ">
            <tr>
                <th class="px-4 py-4 text-background">#</th>
        <th class="px-4 py-2 text-background">User</th>
        <th class="px-4 py-2 text-background">Name</th>
        <th class="px-4 py-2 text-background">Played</th>
        <th class="px-4 py-2 text-background">Won</th>
        <th class="px-4 py-2 text-background">Lost</th>
        <th class="px-4 py-2 text-background">Win&nbsp;%</th>
        <th class="px-4 py-2 text-background">Loss&nbsp;%</th>
                </tr>
            </thead>
            <tbody data-id="ranking-body" class="divide-y divide-secondary">
                <!-- Rows will be injected here -->
            </tbody>
        </table>
    </div>
    `);

  // --- Selectors ---
    const rankingSelector = container.querySelector('[data-id="ranking-body"]') as HTMLElement;

    const users = await api.fetchUsers();

// Fetch stats and pair with users
    const userStatsPairs = await Promise.all(
        users.map(async (user) => {
            const stats = await api.fetchUserStats(user.id);
            return { user, stats };
        })
    );

    // sort by winRate 
    userStatsPairs.sort((a, b) => b.stats.winRate - a.stats.winRate);

    // Loop over sorted pairs / render rows
    for (const [index, { user, stats }] of userStatsPairs.entries()) {
        const row = dom.create(`
            <tr class="cursor-pointer hover:bg-darkerBackground transition">
                <td class="px-4 py-2">${index + 1}</td>
                <td class="px-0 py-2 " data-id="user-cell"></td>
                <td class="px-4 py-2">${user.username}</td>
                <td class="px-4 py-2" data-id="matches-played">0</td>
                <td class="px-4 py-2" data-id="matches-won">0</td>
                <td class="px-4 py-2" data-id="matches-lost">0</td>
                <td class="px-4 py-2" data-id="win-rate">0%</td>
                <td class="px-4 py-2" data-id="lose-rate">0%</td>
            </tr>
        `);

        const userCell = row.querySelector('[data-id="user-cell"]') as HTMLElement;
        const avatar = avatarComponent(user, 64);
        dom.mount(userCell, avatar);

        row.querySelector('[data-id="matches-played"]')!.textContent = `${stats.matchesPlayed}`;
        row.querySelector('[data-id="matches-won"]')!.textContent = `${stats.matchesWon}`;
        row.querySelector('[data-id="matches-lost"]')!.textContent = `${stats.matchesLost}`;
        row.querySelector('[data-id="win-rate"]')!.textContent = `${stats.winRate.toFixed(1)}%`;
        row.querySelector('[data-id="lose-rate"]')!.textContent = `${stats.loseRate.toFixed(1)}%`;

        row.addEventListener("click", () => {
            router.goToProfile(user);
        });


        rankingSelector.appendChild(row);
    }

    return container;
}

export default rankingComponent;
