import dom from '../../shared/dom.js';

interface Match {
  players: [string, string];
  scores: [number, number];
}

interface TournamentProps {
  semiFinals: Match[];
  final: Match | null;
}

function trophyIcon(): HTMLElement {
  return dom.create(`
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="inline-block w-6 h-6 ml-2 text-blue-500">
      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
    </svg>
  `);
}

function renderMatch(match: Match): HTMLElement {
  console.log("tournamentComponent: rendering match", JSON.stringify(match));

  const container = dom.create(`
    <div class="mb-4 rounded-md px-4 py-2 text-white bg-gray-900"></div>
  `);

  match.players.forEach((playerName, idx) => {
    const score = match.scores[idx];
    const opponentScore = match.scores[1 - idx];
    const isWinner = score > opponentScore;

    console.log(`tournamentComponent: rendering player "${playerName}" with score ${score}`);

    const playerRow = dom.create(`
      <div class="grid grid-flow-col grid-cols-2 items-center">
        <div class="flex items-center font-semibold">
          <span>${playerName || "Loading..."}</span>
        </div>
        <p class="text-right">${score}</p>
      </div>
    `);

    if (isWinner) {
      const leftCell = playerRow.querySelector('div.flex');
      if (leftCell) {
        leftCell.appendChild(trophyIcon());
        console.log(`tournamentComponent: "${playerName}" is the winner`);
      }
    }

    container.appendChild(playerRow);
  });

  return container;
}

function tournamentComponent(props: TournamentProps): { 
  element: HTMLElement; 
  update: (newProps: TournamentProps) => void 
} {
  const semiFinals: Match[] = props.semiFinals || [];
  let final: Match | null = props.final || null;

  console.log("tournamentComponent: initial props", JSON.stringify({ semiFinals, final }));

  const component = dom.create(`
    <div class="m-2 p-4">
      <div class="mb-4 grid grid-flow-col grid-cols-2 items-center text-center text-lg font-headline text-lightText font-bold">
        <div>Semi Finals</div>
        <div>Final</div>
      </div>
      <div class="grid grid-flow-col grid-cols-2 items-center">
        <div class="grid grid-flow-row grid-rows-2"></div>
        <div class="mx-2 grid h-1/2 grid-flow-row grid-rows-1"></div>
      </div>
    </div>
  `);

  const semifinalContainer = component.querySelector('div.grid-flow-row.grid-rows-2') as HTMLElement;
  const finalContainer = component.querySelector('div.mx-2.grid') as HTMLElement;

  const renderMatches = () => {
    console.log("tournamentComponent: rendering matches");
    semifinalContainer.innerHTML = '';
    finalContainer.innerHTML = '';

    semiFinals.forEach((match, idx) => {
      console.log(`tournamentComponent: rendering semi-final match ${idx}`);
      semifinalContainer.appendChild(renderMatch(match));
    });

    if (final) {
      console.log("tournamentComponent: rendering final match");
      finalContainer.appendChild(renderMatch(final));
    } else {
      console.log("tournamentComponent: no final match to render");
    }
  };

  renderMatches();

  return { 
    element: component, 
    update: (newProps: TournamentProps) => {
      console.log("tournamentComponent: update called with", JSON.stringify(newProps));

      const newSemiFinals = newProps.semiFinals || [];
      const newFinal = newProps.final || null;

      if (JSON.stringify(newSemiFinals) !== JSON.stringify(semiFinals) ||
          JSON.stringify(newFinal) !== JSON.stringify(final)) {
        console.log("tournamentComponent: props changed, re-rendering");

        semiFinals.length = 0;
        semiFinals.push(...newSemiFinals);

        final = newFinal;

        renderMatches();
      } else {
        console.log("tournamentComponent: no changes detected, skipping render");
      }
    }
  };
}

export default tournamentComponent;
