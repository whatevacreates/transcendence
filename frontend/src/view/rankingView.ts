import dom from "../shared/dom.js"
import rankingComponent from "../component/rankingComponent.js"

async function RankingView(): Promise<HTMLElement> {
    const rankingView = dom.create(`
        <div class="w-full mx-auto space-y-10">
            <div data-id="ranking-component"></div>
        </div>
    `)

    const rankingSelector: HTMLElement | null = rankingView.querySelector('[data-id="ranking-component"]');
    const component = await rankingComponent();

    if (rankingSelector)
        dom.mount(rankingSelector, component);

    return rankingView;
}

export default RankingView;